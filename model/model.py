import pandas as pd
import re
import random
from collections import defaultdict
import math

stop_words = set([
    # articles
    'a', 'an', 'the',
    
    # prepositions
    'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up', 
    'about', 'into', 'through', 'during', 'before', 'after', 'above', 
    'below', 'between', 'out', 'off', 'over', 'under', 'again',
    
    # conjunctions
    'and', 'but', 'or', 'nor', 'so', 'yet', 'both', 'either', 
    'neither', 'although', 'because', 'since', 'while', 'if', 'than',
    
    # pronouns
    'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 
    'your', 'yours', 'yourself', 'he', 'him', 'his', 'himself', 'she', 
    'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 
    'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this',
    'that', 'these', 'those',
    
    # auxiliary verbs
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 
    'had', 'do', 'does', 'did', 'will', 'would', 'shall', 'should', 
    'may', 'might', 'must', 'can', 'could',
    
    # common words
    'not', 'no', 'as', 'just', 'than', 'too', 'very', 'also', 'then', 
    'now', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'each', 
    'every', 'both', 'few', 'more', 'most', 'other', 'some', 'such', 
    'only', 'own', 'same', 'so', 'any', 'once'
])
negative_words={'not', 'no', 'never', 'neither', 'nor', 'nowhere', 'nothing'}
intensifiers = {'very', 'too', 'just', 'only'}
stop_words=stop_words-negative_words-intensifiers

# get data
reviews_dataset= pd.read_csv('electronics_review_sentiment.csv')
reviews_dataset= reviews_dataset[['text', 'review_sentiment']]

# clear null field rows
reviews_dataset=reviews_dataset.dropna()

# total documents or reviews
total_reviews=len(reviews_dataset['text'])


# data preprocess
def clean_text(text):
    text=text.lower()
    text=re.sub(r'[^a-z\s]','',text)
    words = text.split()
    words=[word for word in words if word not in stop_words]
    return words

# separated words
reviews_dataset['cleaned']=reviews_dataset['text'].apply(clean_text)
# print(reviews_dataset['cleaned'].head(5))

def get_total_word_count():
    total_word_count=0
    for words in reviews_dataset['cleaned']:
       total_word_count+=len(words)
    return total_word_count

# total word count of all the reviews
print(f'Total words counts of all reviews:{get_total_word_count()}')

# to get unique words

# print(type(unique_word))
# count=0
# for words in reviews_dataset['cleaned'].head(5):
#     count+=1
#     print(f'row{[count]}:{words}')


def get_unique_words():
    unique_words = set()
    for words in reviews_dataset['cleaned']:
        for word in words:
            unique_words.add(word)
    print(f'Total unique words:{len(unique_words)}')
    return unique_words
unique_words=get_unique_words()

def calculate_tf(words):
    tf = {}
    total_words = len(words)
    for word in words:
        if word not in tf:
            tf[word] = 0
        tf[word] += 1
    # divide by total words in that review
    for word in tf:
        tf[word] = tf[word] / total_words
    return tf

# apply to each row
reviews_dataset['tf'] = reviews_dataset['cleaned'].apply(calculate_tf)


def calculate_idf():
    idf = {}
    for word in unique_words:
        # count how many reviews contain this word
        doc_count = 0
        for words in reviews_dataset['cleaned']:
            if word in words:
                doc_count += 1
        # idf formula
        idf[word] = math.log(total_reviews / (doc_count + 1))  # +1 to avoid division by zero
    return idf

idf = calculate_idf()

def calculate_idf():
    idf = {}
    for word in unique_words:
        doc_count = sum(1 for words in reviews_dataset['cleaned'] if word in words)
        idf[word] = math.log(total_reviews / (doc_count + 1))
    return idf
print(reviews_dataset['tfidf'].iloc[0])

# random.seed(42)
# indices = list(range(len(reviews_dataset)))
# random.shuffle(indices)
# split = int(0.8*len(indices))
# train_idx= indices[:split]
# test_idx = indices[split:]
# train= reviews_dataset.iloc[train_idx]
# test= reviews_dataset.iloc[test_idx]


# # algorithm of naive bayes

# class NaiveBayes:
#     def __init__(self):
#         self.class_probs ={}
#         self.word_probs={}
#         self.vocab= set()

#     def train(self, X, y):
#         total_docs= len(y)
#         classes = y.unique()

#         word_counts={}
#         class_counts={}

#         for c in classes:
#             class_counts[c]=0
#             word_counts[c]= defaultdict(int)

#         for words, label in zip(X, y):
#             class_counts[label]+=1
#             for word in words:
#                 word_counts[label][word]+=1
#                 self.vocab.add(word)
        
#         vocab_size = len(self.vocab)

#         for c in classes:
#             self.class_probs[c]=math.log(class_counts[c]/total_docs)

#         self.word_probs={}
#         for c in classes:
#             self.word_probs[c] = {}
#             total_words = sum(word_counts[c].values())
#             for word in self.vocab:
#                 count = word_counts[c].get(word, 0)
#                 # laplace smoothing: add 1 to avoid zero probability
#                 self.word_probs[c][word] = math.log((count + 1) / (total_words + vocab_size))

#     def predict(self, words):
#         scores = {}
#         for c, class_prob in self.class_probs.items():
#             scores[c] = class_prob
#             for word in words:
#                 if word in self.vocab:
#                     scores[c] += self.word_probs[c][word]
#         print(f'Total positive reviews:{len(class_prob)}')
#         return max(scores, key=scores.get)

# model = NaiveBayes()
# model.train(train['cleaned'], train['review_sentiment'])

# test['predicted']=test['cleaned'].apply(model.predict)

# correct=sum(test['predicted']==test['review_sentiment'])
# accuracy=correct/len(test)*100
# print(f'Accuracy:{accuracy:2f}%')
# # print(reviews_dataset.dtypes)
# # print(reviews_dataset['rating'].unique)


