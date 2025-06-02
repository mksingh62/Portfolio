import os
import nltk
import numpy as np
from nltk.stem.porter import PorterStemmer

# Ensure local nltk data dir
nltk_data_dir = os.path.join(os.getcwd(), "nltk_data")
nltk.data.path.append(nltk_data_dir)

# Fix: Download only necessary tokenizer resource
try:
    nltk.data.find("tokenizers/punkt")
except LookupError:
    nltk.download("punkt", download_dir=nltk_data_dir)

stemmer = PorterStemmer()

def tokenize(sentence):
    # Use standard punkt tokenizer
    from nltk.tokenize import word_tokenize
    return word_tokenize(sentence)

def stem(word):
    return stemmer.stem(word.lower())

def bag_of_words(tokenized_sentence, words):
    sentence_words = [stem(word) for word in tokenized_sentence]
    bag = np.zeros(len(words), dtype=np.float32)
    for idx, w in enumerate(words):
        if w in sentence_words:
            bag[idx] = 1
    return bag
