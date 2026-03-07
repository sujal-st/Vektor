import pandas as pd
import re
import random
import math
from collections import defaultdict

# ─────────────────────────────────────────────
# STOP WORDS
# ─────────────────────────────────────────────
stop_words = set([
    'a', 'an', 'the',
    'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from', 'up',
    'about', 'into', 'through', 'during', 'before', 'after', 'above',
    'below', 'between', 'out', 'off', 'over', 'under', 'again',
    'and', 'but', 'or', 'nor', 'so', 'yet', 'both', 'either',
    'neither', 'although', 'because', 'since', 'while', 'if', 'than',
    'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you',
    'your', 'yours', 'yourself', 'he', 'him', 'his', 'himself', 'she',
    'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them',
    'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom',
    'this', 'that', 'these', 'those',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has',
    'had', 'do', 'does', 'did', 'will', 'would', 'shall', 'should',
    'may', 'might', 'must', 'can', 'could',
    'as', 'than', 'also', 'then', 'now', 'here', 'there', 'when',
    'where', 'why', 'how', 'all', 'each', 'every', 'few', 'more',
    'most', 'other', 'some', 'such', 'own', 'same', 'so', 'any', 'once'
])

# Keep these — they matter for sentiment
negative_words = {'not', 'no', 'never', 'neither', 'nor', 'nowhere', 'nothing'}
intensifiers   = {'very', 'too', 'just', 'only'}
stop_words     = stop_words - negative_words - intensifiers


# ─────────────────────────────────────────────
# STEP 1 — LOAD & CLEAN DATA
# ─────────────────────────────────────────────
def load_and_clean_data(filepath):
    df = pd.read_csv(filepath)
    df = df[['text', 'review_sentiment']]
    df = df.dropna()

    # FIX 1: normalize labels to lowercase to avoid mismatch (Positive → positive)
    df['review_sentiment'] = df['review_sentiment'].str.lower().str.strip()

    # FIX 2: use random sample instead of head() so all classes are represented
    df = df.sample(175900, random_state=42)

    # balance classes (alternative approach)
    min_count = df['review_sentiment'].value_counts().min()
    positive  = df[df['review_sentiment'] == 'positive'].sample(min_count, random_state=42)
    negative  = df[df['review_sentiment'] == 'negative'].sample(min_count, random_state=42)
    neutral   = df[df['review_sentiment'] == 'neutral'].sample(min_count, random_state=42)
    df        = pd.concat([positive, negative, neutral]).reset_index(drop=True)

    df['cleaned'] = df['text'].apply(clean_text)
    print(f"Dataset loaded: {len(df)} reviews")

    # FIX 3: show class distribution so you can verify all classes are present
    print(f"Class distribution:\n{df['review_sentiment'].value_counts()}\n")
    return df


def clean_text(text):
    text  = text.lower()
    text  = re.sub(r'[^a-z\s]', '', text)
    words = text.split()
    words = [w for w in words if w not in stop_words]
    return words


# ─────────────────────────────────────────────
# STEP 2 — TRAIN / TEST SPLIT
# ─────────────────────────────────────────────
def split_dataset(df, train_ratio=0.7):
    indices = list(range(len(df)))
    random.seed(42)
    random.shuffle(indices)
    split    = int(train_ratio * len(indices))
    train_df = df.iloc[indices[:split]].reset_index(drop=True)
    test_df  = df.iloc[indices[split:]].reset_index(drop=True)
    print(f"Train: {len(train_df)} | Test: {len(test_df)}")
    return train_df, test_df


# ─────────────────────────────────────────────
# STEP 3 — TF-IDF
# ─────────────────────────────────────────────
def calculate_tf(words):
    """Term Frequency: count of word / total words in review."""
    tf          = {}
    total_words = len(words)
    if total_words == 0:
        return tf
    for word in words:
        tf[word] = tf.get(word, 0) + 1
    for word in tf:
        tf[word] = tf[word] / total_words
    return tf


def calculate_idf(df):
    """Inverse Document Frequency — single pass for speed."""
    total_docs     = len(df)
    doc_word_count = defaultdict(int)

    # FIX 4: single pass through reviews (much faster than original nested loop)
    for words in df['cleaned']:
        unique_in_review = set(words)  # count each word once per review
        for word in unique_in_review:
            doc_word_count[word] += 1

    idf = {}
    for word, count in doc_word_count.items():
        idf[word] = math.log(total_docs / (count + 1))  # +1 avoids division by zero
    return idf


def calculate_tfidf(words, idf):
    """TF-IDF = TF * IDF for each word in a review."""
    tf    = calculate_tf(words)
    tfidf = {}
    for word, tf_val in tf.items():
        tfidf[word] = tf_val * idf.get(word, 0)
    return tfidf


# ─────────────────────────────────────────────
# STEP 4 — BUILD SENTIMENT DICTIONARIES
# ─────────────────────────────────────────────
def build_sentiment_dictionaries(train_df, idf):
    """
    Accumulate TF-IDF scores per class.
    positive_dict[word] = total TF-IDF score across all positive reviews
    negative_dict[word] = total TF-IDF score across all negative reviews
    neutral_dict[word]  = total TF-IDF score across all neutral reviews
    """
    positive_dict = defaultdict(float)
    negative_dict = defaultdict(float)
    neutral_dict  = defaultdict(float)

    for _, row in train_df.iterrows():
        tfidf     = calculate_tfidf(row['cleaned'], idf)
        sentiment = row['review_sentiment']

        for word, score in tfidf.items():
            if sentiment == 'positive':
                positive_dict[word] += score
            elif sentiment == 'negative':
                negative_dict[word] += score
            elif sentiment == 'neutral':
                neutral_dict[word] += score

    print(f"Positive dictionary: {len(positive_dict)} unique words")
    print(f"Negative dictionary: {len(negative_dict)} unique words")
    print(f"Neutral dictionary : {len(neutral_dict)} unique words")
    return dict(positive_dict), dict(negative_dict), dict(neutral_dict)


# ─────────────────────────────────────────────
# STEP 5 — NAIVE BAYES CLASSIFIER
# ─────────────────────────────────────────────
class NaiveBayesSentiment:

    def __init__(self):
        self.prior_positive = 0.0
        self.prior_negative = 0.0
        self.prior_neutral  = 0.0
        self.positive_dict  = {}
        self.negative_dict  = {}
        self.neutral_dict   = {}
        self.total_positive = 0.0
        self.total_negative = 0.0
        self.total_neutral  = 0.0
        self.vocab_size     = 0

    def train(self, train_df, idf):
        total       = len(train_df)
        pos_reviews = train_df[train_df['review_sentiment'] == 'positive']
        neg_reviews = train_df[train_df['review_sentiment'] == 'negative']
        neu_reviews = train_df[train_df['review_sentiment'] == 'neutral']

        print(f"Positive reviews in train: {len(pos_reviews)}")
        print(f"Negative reviews in train: {len(neg_reviews)}")
        print(f"Neutral reviews in train : {len(neu_reviews)}")

        # FIX 5: guard against empty classes to avoid math.log(0) error
        self.prior_positive = math.log(len(pos_reviews) / total) if len(pos_reviews) > 0 else float('-inf')
        self.prior_negative = math.log(len(neg_reviews) / total) if len(neg_reviews) > 0 else float('-inf')
        self.prior_neutral  = math.log(len(neu_reviews) / total) if len(neu_reviews) > 0 else float('-inf')

        # Build dictionaries
        self.positive_dict, self.negative_dict, self.neutral_dict = build_sentiment_dictionaries(train_df, idf)

        # Total TF-IDF mass per class
        self.total_positive = sum(self.positive_dict.values())
        self.total_negative = sum(self.negative_dict.values())
        self.total_neutral  = sum(self.neutral_dict.values())

        # Vocabulary size across all classes
        all_words       = set(self.positive_dict.keys()) | set(self.negative_dict.keys()) | set(self.neutral_dict.keys())
        self.vocab_size = len(all_words)

        print(f"\nPrior P(positive): {math.exp(self.prior_positive):.4f}" if self.prior_positive != float('-inf') else "Prior P(positive): 0")
        print(f"Prior P(negative): {math.exp(self.prior_negative):.4f}" if self.prior_negative != float('-inf') else "Prior P(negative): 0")
        print(f"Prior P(neutral) : {math.exp(self.prior_neutral):.4f}"  if self.prior_neutral  != float('-inf') else "Prior P(neutral): 0")

    def predict(self, words, idf):
        tfidf = calculate_tfidf(words, idf)

        score_positive = self.prior_positive
        score_negative = self.prior_negative
        score_neutral  = self.prior_neutral

        for word, tfidf_val in tfidf.items():
            # P(word | class) with Laplace smoothing
            p_word_pos = (self.positive_dict.get(word, 0) + 1) / (self.total_positive + self.vocab_size)
            p_word_neg = (self.negative_dict.get(word, 0) + 1) / (self.total_negative + self.vocab_size)
            p_word_neu = (self.neutral_dict.get(word, 0)  + 1) / (self.total_neutral  + self.vocab_size)

            # Weight by TF-IDF score
            score_positive += tfidf_val * math.log(p_word_pos)
            score_negative += tfidf_val * math.log(p_word_neg)
            score_neutral  += tfidf_val * math.log(p_word_neu)

        # Return class with highest score
        scores = {'positive': score_positive, 'negative': score_negative, 'neutral': score_neutral}
        return max(scores, key=scores.get)


# ─────────────────────────────────────────────
# STEP 6 — EVALUATE ON TEST SET
# ─────────────────────────────────────────────
def evaluate(model, test_df, idf):
    correct = 0
    for _, row in test_df.iterrows():
        predicted = model.predict(row['cleaned'], idf)
        actual    = row['review_sentiment'].strip().lower()
        if predicted == actual:
            correct += 1
    accuracy = correct / len(test_df) * 100
    print(f"\nTest Accuracy: {accuracy:.2f}%  ({correct}/{len(test_df)} correct)")
    return accuracy


# ─────────────────────────────────────────────
# STEP 7 — CLASSIFY UNLABELED DATA
# ─────────────────────────────────────────────
def classify_unlabeled(model, unlabeled_reviews, idf):
    positive_reviews = []
    negative_reviews = []
    neutral_reviews  = []

    for review in unlabeled_reviews:
        cleaned   = clean_text(review)
        predicted = model.predict(cleaned, idf)
        if predicted == 'positive':
            positive_reviews.append(review)
        elif predicted == 'negative':
            negative_reviews.append(review)
        else:
            neutral_reviews.append(review)

    print(f"\n── Unlabeled Review Classification Results ──")
    print(f"Total reviews  : {len(unlabeled_reviews)}")
    print(f"Positive       : {len(positive_reviews)}")
    print(f"Negative       : {len(negative_reviews)}")
    print(f"Neutral        : {len(neutral_reviews)}")

    print(f"\nPositive reviews:")
    for r in positive_reviews:
        print(f"  {r}")

    print(f"\nNegative reviews:")
    for r in negative_reviews:
        print(f"  {r}")

    print(f"\nNeutral reviews:")
    for r in neutral_reviews:
        print(f"  {r}")

    return positive_reviews, negative_reviews, neutral_reviews


# ─────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────
if __name__ == '__main__':

    # 1. Load and clean
    df = load_and_clean_data('electronics_review_sentiment.csv')

    # 2. Split
    train_df, test_df = split_dataset(df)

    # 3. Calculate IDF on training data only
    print("\nCalculating IDF...")
    idf = calculate_idf(train_df)
    print(f"IDF calculated for {len(idf)} unique words")

    # 4. Train model
    print("\nTraining Naive Bayes model...")
    model = NaiveBayesSentiment()
    model.train(train_df, idf)

    # 5. Evaluate
    evaluate(model, test_df, idf)

    # 6. Classify new unlabeled reviews
    unlabeled_reviews = [
    "This laptop is absolutely fantastic, best purchase I have made this year",
    "The sound quality on these headphones is incredible, very happy with them",
    "Battery life is amazing, lasts all day without needing a charge",
    "Setup was super easy and the product works exactly as described",
    "Excellent build quality, feels very premium and sturdy",

    "Stopped working after just one week, complete waste of money",
    "The screen cracked on its own, very poor quality material",
    "Customer service was terrible and refused to give me a refund",
    "This charger gets extremely hot, feels very unsafe to use",
    "Totally disappointed, the product looks nothing like the pictures",

    "The product is okay, nothing special but gets the job done",
    "Arrived on time but the packaging was damaged",
    "Works fine for the price, not expecting anything great",
    "Average quality, neither good nor bad",
    "Does what it says but nothing more",

    "Not bad at all, actually quite impressed with the performance",
    "Not what I expected but it still works well enough",
    "Never had any issues so far, fingers crossed it stays that way",
    "Could not be happier with this product, highly recommend",
    "Would not recommend this to anyone, very frustrating experience",
]

    classify_unlabeled(model, unlabeled_reviews, idf)