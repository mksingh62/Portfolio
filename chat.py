import random
import json
import torch
import numpy as np
import sys
from model import NeuralNet
from nltk_utils import bag_of_words, tokenize
import torch.nn as nn

def get_response(sentence):
    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

    with open('intents.json', 'r') as json_data:
        intents = json.load(json_data)

    FILE = "portfolio.pth"
    data = torch.load(FILE)

    input_size = data["input_size"]
    hidden_size = data["hidden_size"]
    output_size = data["output_size"]
    all_words = data['all_words']
    categories = data['tags']
    model_state = data["model_state"]

    model = NeuralNet(input_size, hidden_size, output_size).to(device)
    model.load_state_dict(model_state)
    model.eval()

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
    else:
        return "I do not understand. Can you please provide an appropriate response?"

if __name__ == "__main__":
    if len(sys.argv) > 1:
        # If message is provided as command line argument
        message = sys.argv[1]
    else:
        # Read message from stdin
        message = sys.stdin.readline().strip()
    
    response = get_response(message)
    print(f"Mahi: {response}")
