#!/usr/bin/env python

# This task does nothing and can be used to test sending
# messages to the queue

import sys
import os

# get around sibling import problem
script_dir = os.path.dirname(os.path.realpath(__file__))
sys.path.insert(0, os.path.join(script_dir,'..'))

from utils import parse_params

print("Test task")

params = parse_params()

print(params)
