import os
import subprocess
import json

with open("joblist.txt", "r") as joblist:
    jobs = joblist.read().splitlines()[1:]
    puzzles = []
    for i, job in enumerate(jobs):
        cmd = f'{job}'
        result = subprocess.run(job.split(), stdout=subprocess.PIPE).stdout
        tpuzz = str(result.decode()).split("===========")
        puzzles.extend(tpuzz)
    outpuzz = []
    for p in puzzles:
        puzz = ''.join(p.split())
        if (len(puzz) == 81):
            outpuzz.append(puzz)
    with open('puzzlestmp.txt', 'w') as tmpfile:
        tmpfile.write('\n'.join(outpuzz))
    minimals = subprocess.run(
        ['../minimize/suex9', 'puzzlestmp.txt'], stdout=subprocess.PIPE).stdout.split()
    pairs = []
    for i in range(len(puzzles)):
        pairs.append(
            {
                "puzzle": puzzles[i],
                "minimal": minimals[i]
            }
        )
    # print(minimals)
    with open("puzzles.json", "w") as outfile:
        json.dump(pairs, outfile)
