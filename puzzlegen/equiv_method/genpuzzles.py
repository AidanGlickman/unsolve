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
    with open("puzzles.json", "w") as outfile:
        json.dump(outpuzz, outfile)
