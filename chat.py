import random
import json
import torch
import numpy as np
from model import NeuralNet
from nltk_utils import bag_of_words, tokenize
import torch.nn as nn

# Device setup
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# Load intents once
with open('intents.json', 'r') as json_data:
    intents = json.load(json_data)

# Load model data once
FILE = "portfolio.pth"
data = torch.load(FILE, map_location=device)

input_size = data["input_size"]
hidden_size = data["hidden_size"]
output_size = data["output_size"]
all_words = data['all_words']
categories = data['tags']
model_state = data["model_state"]

# Load model once
model = NeuralNet(input_size, hidden_size, output_size).to(device)
model.load_state_dict(model_state)
model.eval()  # important!

# Now only this runs on each call
def get_response(sentence):
    sentence_tokens = tokenize(sentence)
    X = bag_of_words(sentence_tokens, all_words)
    X = X.reshape(1, X.shape[0])
    X = torch.from_numpy(X).to(device)

    output = model(X)
    _, predicted = torch.max(output, dim=1)

    category = categories[predicted.item()]
    probs = torch.softmax(output, dim=1)
    prob = probs[0][predicted.item()]

    if prob.item() > 0.75:
        for intent in intents['intents']:
            if category == intent["category"]:
                return random.choice(intent['responses'])

    return "I do not understand. Can you please provide an appropriate response?"


# For CLI testing only
if __name__ == "__main__":
    import sys
    if len(sys.argv) > 1:
        message = sys.argv[1]
    else:
        message = sys.stdin.readline().strip()

    response = get_response(message)
    print(f"Mahi: {response}")
