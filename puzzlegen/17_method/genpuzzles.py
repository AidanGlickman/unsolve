import os
import subprocess
import json

solved = subprocess.run(["../solve/suexk", "raw_17s.txt", "p"],
                        stdout=subprocess.PIPE).stdout.split()
with open("raw_17s.txt", "r") as rawfile:
    raws = rawfile.read().replace("0", ".").splitlines()
pairs = []
assert (len(raws) == len(solved))
for i in range(len(raws)):
    pairs.append(
        {
            "puzzle": solved[i].decode(),
            "minimal": raws[i]
        }
    )
with open("puzzles.json", "w") as outfile:
    json.dump(pairs, outfile)
