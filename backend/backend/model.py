""" this section is to load the model and tokenizer """
from typing import List
import numpy as np
import pandas as pd
import warnings
import logging
import os
import shutil
import json
import transformers
from transformers import (
    AutoModel,
    AutoTokenizer,
    AutoConfig,
    AutoModelForSequenceClassification,
)
from transformers import DataCollatorWithPadding
from datasets import Dataset, load_dataset, load_from_disk
from transformers import TrainingArguments, Trainer
try:
    from datasets import load_metric, disable_progress_bar
except ImportError:
    from evaluate import load as load_metric
    disable_progress_bar = lambda: None
from sklearn.metrics import mean_squared_error
import torch
from sklearn.model_selection import KFold, GroupKFold
from tqdm import tqdm

import nltk

# nltk.download('stopwords')
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.tokenize.treebank import TreebankWordDetokenizer
from collections import Counter
import spacy
import re
from autocorrect import Speller
from spellchecker import SpellChecker
import lightgbm as lgb
from tqdm import tqdm
from pathlib import Path
import torch


warnings.simplefilter("ignore")
logging.disable(logging.ERROR)
os.environ["TOKENIZERS_PARALLELISM"] = "false"
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
disable_progress_bar()
tqdm.pandas()
# BASE_DIR = Path(__file__).resolve().parent.parent  # Get the directory of the current script
# model_path = os.path.join(BASE_DIR, "model/saved_model")
# from transformers import AutoTokenizer


# class model():
#     def get_model():
#         with open(model_path, 'rb') as f:
#             loaded_model = pickle.load(f)
#         return loaded_model

#     def get_tokenizer():
#         tokenizer = AutoTokenizer.from_pretrained("tokenizer")
#         return tokenizer

# prompt_id = "ebad26"
# student_id = "20003432"
# input_summary = 'They would rub it up with soda to make the smell go away and it wouldnt be a bad smell. Some of the meat would be tossed on the floor where there was sawdust spit of the workers and they would make the meat all over again with the things in it.'


def get_content_and_wording(prompt_id, student_id, input_summary):
    BASE_DIR = Path(__file__).resolve().parent.parent
    print(BASE_DIR)
    DATA_DIR = os.path.join(BASE_DIR, "csv/")

    prompts_test = pd.read_csv(DATA_DIR + "prompts_train.csv")
    summaries_test = pd.read_csv(DATA_DIR + "summaries_test.csv")

    prompts_test = prompts_test[prompts_test["prompt_id"] == prompt_id]
    # prompts_test

    input_record = {
        "student_id": student_id,
        "prompt_id": prompt_id,
        "text": input_summary,
    }
    summaries_test = summaries_test.drop(summaries_test.index)
    # summaries_test = summaries_test.append(input_record, ignore_index = True)
    # summaries_test
    new_data = [input_record]
    new_df = pd.DataFrame(new_data)
    summaries_test = pd.concat([summaries_test, new_df], ignore_index=True)

    path = os.path.join(BASE_DIR, "model/")

    class CFG:
        model_name = "debertav3base"
        learning_rate = 1.5e-5
        weight_decay = 0.02
        hidden_dropout_prob = 0.007
        attention_probs_dropout_prob = 0.007
        num_train_epochs = 5
        n_splits = 4
        batch_size = 12
        random_seed = 42
        save_steps = 100
        max_length = 512

    def seed_everything(seed: int):
        import random, os
        import numpy as np
        import torch

        random.seed(seed)
        os.environ["PYTHONHASHSEED"] = str(seed)
        np.random.seed(seed)
        torch.manual_seed(seed)
        torch.cuda.manual_seed(seed)
        torch.backends.cudnn.deterministic = True
        torch.backends.cudnn.benchmark = True

    seed_everything(seed=42)

    class Preprocessor:
        def __init__(
            self,
            model_name: str,
        ) -> None:
            # path = os.path.join(BASE_DIR,'model/')
            self.tokenizer = AutoTokenizer.from_pretrained(path + f"{model_name}")
            self.twd = TreebankWordDetokenizer()
            self.STOP_WORDS = set(stopwords.words("english"))

            self.spacy_ner_model = spacy.load(
                "en_core_web_sm",
            )
            self.speller = Speller(lang="en")
            self.spellchecker = SpellChecker()

        def word_overlap_count(self, row):
            """intersection(prompt_text, text)"""

            def check_is_stop_word(word):
                return word in self.STOP_WORDS

            prompt_words = row["prompt_tokens"]
            summary_words = row["summary_tokens"]
            if self.STOP_WORDS:
                prompt_words = list(filter(check_is_stop_word, prompt_words))
                summary_words = list(filter(check_is_stop_word, summary_words))
            return len(set(prompt_words).intersection(set(summary_words)))

        def ngrams(self, token, n):
            # Use the zip function to help us generate n-grams
            # Concatentate the tokens into ngrams and return
            ngrams = zip(*[token[i:] for i in range(n)])
            return [" ".join(ngram) for ngram in ngrams]

        def ngram_co_occurrence(self, row, n: int) -> int:
            # Tokenize the original text and summary into words
            original_tokens = row["prompt_tokens"]
            summary_tokens = row["summary_tokens"]

            # Generate n-grams for the original text and summary
            original_ngrams = set(self.ngrams(original_tokens, n))
            summary_ngrams = set(self.ngrams(summary_tokens, n))

            # Calculate the number of common n-grams
            common_ngrams = original_ngrams.intersection(summary_ngrams)
            return len(common_ngrams)

        def ner_overlap_count(self, row, mode: str):
            model = self.spacy_ner_model

            def clean_ners(ner_list):
                return set([(ner[0].lower(), ner[1]) for ner in ner_list])

            prompt = model(row["prompt_text"])
            summary = model(row["text"])

            if "spacy" in str(model):
                prompt_ner = set([(token.text, token.label_) for token in prompt.ents])
                summary_ner = set(
                    [(token.text, token.label_) for token in summary.ents]
                )
            elif "stanza" in str(model):
                prompt_ner = set([(token.text, token.type) for token in prompt.ents])
                summary_ner = set([(token.text, token.type) for token in summary.ents])
            else:
                raise Exception("Model not supported")

            prompt_ner = clean_ners(prompt_ner)
            summary_ner = clean_ners(summary_ner)

            intersecting_ners = prompt_ner.intersection(summary_ner)

            ner_dict = dict(Counter([ner[1] for ner in intersecting_ners]))

            if mode == "train":
                return ner_dict
            elif mode == "test":
                return {key: ner_dict.get(key) for key in self.ner_keys}

        def quotes_count(self, row):
            summary = row["text"]
            text = row["prompt_text"]
            quotes_from_summary = re.findall(r'"([^"]*)"', summary)
            if len(quotes_from_summary) > 0:
                return [quote in text for quote in quotes_from_summary].count(True)
            else:
                return 0

        def spelling(self, text):
            wordlist = text.split()
            amount_miss = len(list(self.spellchecker.unknown(wordlist)))

            return amount_miss

        def add_spelling_dictionary(self, tokens: List[str]) -> List[str]:
            """dictionary update for pyspell checker and autocorrect"""
            self.spellchecker.word_frequency.load_words(tokens)
            self.speller.nlp_data.update({token: 1000 for token in tokens})

        def run(
            self, prompts: pd.DataFrame, summaries: pd.DataFrame, mode: str
        ) -> pd.DataFrame:
            # before merge preprocess
            prompts["prompt_length"] = prompts["prompt_text"].apply(
                lambda x: len(word_tokenize(x))
            )
            prompts["prompt_tokens"] = prompts["prompt_text"].apply(
                lambda x: word_tokenize(x)
            )

            summaries["summary_length"] = summaries["text"].apply(
                lambda x: len(word_tokenize(x))
            )
            summaries["summary_tokens"] = summaries["text"].apply(
                lambda x: word_tokenize(x)
            )

            # Add prompt tokens into spelling checker dictionary
            prompts["prompt_tokens"].apply(lambda x: self.add_spelling_dictionary(x))

            #         from IPython.core.debugger import Pdb; Pdb().set_trace()
            # fix misspelling
            summaries["fixed_summary_text"] = summaries["text"].progress_apply(
                lambda x: self.speller(x)
            )

            # count misspelling
            summaries["splling_err_num"] = summaries["text"].progress_apply(
                self.spelling
            )

            # merge prompts and summaries
            input_df = summaries.merge(prompts, how="left", on="prompt_id")

            # after merge preprocess
            input_df["length_ratio"] = (
                input_df["summary_length"] / input_df["prompt_length"]
            )

            input_df["word_overlap_count"] = input_df.progress_apply(
                self.word_overlap_count, axis=1
            )
            input_df["bigram_overlap_count"] = input_df.progress_apply(
                self.ngram_co_occurrence, args=(2,), axis=1
            )
            input_df["bigram_overlap_ratio"] = input_df["bigram_overlap_count"] / (
                input_df["summary_length"] - 1
            )

            input_df["trigram_overlap_count"] = input_df.progress_apply(
                self.ngram_co_occurrence, args=(3,), axis=1
            )
            input_df["trigram_overlap_ratio"] = input_df["trigram_overlap_count"] / (
                input_df["summary_length"] - 2
            )

            input_df["quotes_count"] = input_df.progress_apply(
                self.quotes_count, axis=1
            )

            return input_df.drop(columns=["summary_tokens", "prompt_tokens"])

    preprocessor = Preprocessor(model_name=CFG.model_name)

    test = preprocessor.run(prompts_test, summaries_test, mode="test")

    def compute_metrics(eval_pred):
        predictions, labels = eval_pred
        rmse = mean_squared_error(labels, predictions, squared=False)
        return {"rmse": rmse}

    def compute_mcrmse(eval_pred):
        """
        Calculates mean columnwise root mean squared error
        https://www.kaggle.com/competitions/commonlit-evaluate-student-summaries/overview/evaluation
        """
        preds, labels = eval_pred

        col_rmse = np.sqrt(np.mean((preds - labels) ** 2, axis=0))
        mcrmse = np.mean(col_rmse)

        return {
            "content_rmse": col_rmse[0],
            "wording_rmse": col_rmse[1],
            "mcrmse": mcrmse,
        }

    def compt_score(content_true, content_pred, wording_true, wording_pred):
        content_score = mean_squared_error(content_true, content_pred) ** (1 / 2)
        wording_score = mean_squared_error(wording_true, wording_pred) ** (1 / 2)

        return (content_score + wording_score) / 2

    class DebertaRegressor:
        def __init__(
            self,
            model_name: str,
            model_dir: str,
            target: str,
            hidden_dropout_prob: float,
            attention_probs_dropout_prob: float,
            max_length: int,
        ):
            self.inputs = [
                "prompt_text",
                "prompt_title",
                "prompt_question",
                "fixed_summary_text",
            ]
            self.input_col = "input"

            self.text_cols = [self.input_col]
            self.target = target
            self.target_cols = [target]

            self.model_name = model_name
            self.model_dir = model_dir
            self.max_length = max_length

            self.tokenizer = AutoTokenizer.from_pretrained(path + f"{model_name}")
            self.model_config = AutoConfig.from_pretrained(path + f"{model_name}")

            self.model_config.update(
                {
                    "hidden_dropout_prob": hidden_dropout_prob,
                    "attention_probs_dropout_prob": attention_probs_dropout_prob,
                    "num_labels": 1,
                    "problem_type": "regression",
                }
            )

            seed_everything(seed=42)

            self.data_collator = DataCollatorWithPadding(tokenizer=self.tokenizer)

        def tokenize_function(self, examples: pd.DataFrame):
            labels = [examples[self.target]]
            tokenized = self.tokenizer(
                examples[self.input_col],
                padding=False,
                truncation=True,
                max_length=self.max_length,
            )
            return {
                **tokenized,
                "labels": labels,
            }

        def tokenize_function_test(self, examples: pd.DataFrame):
            tokenized = self.tokenizer(
                examples[self.input_col],
                padding=False,
                truncation=True,
                max_length=self.max_length,
            )
            return tokenized

        def predict(
            self,
            test_df: pd.DataFrame,
            fold: int,
        ):
            """predict content score"""

            sep = self.tokenizer.sep_token
            in_text = (
                test_df["prompt_title"]
                + sep
                + test_df["prompt_question"]
                + sep
                + test_df["fixed_summary_text"]
            )
            test_df[self.input_col] = in_text

            test_ = test_df[[self.input_col]]

            test_dataset = Dataset.from_pandas(test_, preserve_index=False)
            test_tokenized_dataset = test_dataset.map(
                self.tokenize_function_test, batched=False
            )

            model_content = AutoModelForSequenceClassification.from_pretrained(
                f"{self.model_dir}"
            )
            model_content.eval()

            # e.g. "bert/fold_0/"
            model_fold_dir = os.path.join("bert/", str(fold))

            test_args = TrainingArguments(
                output_dir=model_fold_dir,
                do_train=False,
                do_predict=True,
                per_device_eval_batch_size=4,
                dataloader_drop_last=False,
            )

            # init trainer
            infer_content = Trainer(
                model=model_content,
                tokenizer=self.tokenizer,
                data_collator=self.data_collator,
                args=test_args,
            )

            preds = infer_content.predict(test_tokenized_dataset)[0]

            return preds

    def predict(
        test_df: pd.DataFrame,
        target: str,
        save_each_model: bool,
        model_name: str,
        hidden_dropout_prob: float,
        attention_probs_dropout_prob: float,
        max_length: int,
    ):
        """predict using mean folds"""
        path = os.path.join(BASE_DIR, "model/deberta_models/")
        for fold in range(CFG.n_splits):
            print(f"fold {fold}:")

            if fold == 0:
                model_dir = path + f"{target}"
                csr = DebertaRegressor(
                    model_name=model_name,
                    target=target,
                    model_dir=model_dir,
                    hidden_dropout_prob=hidden_dropout_prob,
                    attention_probs_dropout_prob=attention_probs_dropout_prob,
                    max_length=max_length,
                )

                pred = csr.predict(test_df=test_df, fold=fold)

            test_df[f"{target}_pred_{fold}"] = pred

        test_df[f"{target}"] = test_df[
            [f"{target}_pred_{fold}" for fold in range(CFG.n_splits)]
        ].mean(axis=1)

        return test_df

    for target in ["content", "wording"]:
        test = predict(
            test,
            target=target,
            save_each_model=False,
            model_name=CFG.model_name,
            hidden_dropout_prob=CFG.hidden_dropout_prob,
            attention_probs_dropout_prob=CFG.attention_probs_dropout_prob,
            max_length=CFG.max_length,
        )

    targets = ["content", "wording"]

    drop_columns = (
        [
            # "fold",
            "student_id",
            "prompt_id",
            "text",
            "fixed_summary_text",
            "prompt_question",
            "prompt_title",
            "prompt_text",
            "input",
        ]
        + [f"content_pred_{i}" for i in range(CFG.n_splits)]
        + [f"wording_pred_{i}" for i in range(CFG.n_splits)]
    )

    model_dict = {"content": [], "wording": []}

    for target in targets:
        for i in range(CFG.n_splits):
            common_path = path + f"lgbm_models/{target}/lgbr_base_{i}.txt"
            loaded_model = lgb.Booster(model_file=common_path)
            model_dict[target].append(loaded_model)

    pred_dict = {}
    for target in targets:
        models = model_dict[target]
        preds = []

        for fold, model in enumerate(models):
            X_eval_cv = test.drop(columns=drop_columns)

            pred = model.predict(X_eval_cv)
            preds.append(pred)

        pred_dict[target] = preds

    for target in targets:
        preds = pred_dict[target]
        for i, pred in enumerate(preds):
            test[f"{target}_pred_{i}"] = pred

        test[target] = test[
            [f"{target}_pred_{fold}" for fold in range(CFG.n_splits)]
        ].mean(axis=1)

    print(test[["student_id", "content", "wording"]])
    return test[["content"]].values[0][0], test[["wording"]].values[0][0]
