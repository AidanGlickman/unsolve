import os
import subprocess
import json

with open("joblist.txt", "r") as joblist:
    jobs = joblist.read().splitlines()[1:]
    puzzles = []
    for i, job in enumerate(jobs):
        cmd = f'{job} > puzzles/{i}.txt'
        print(cmd)
        result = subprocess.run(job.split(), stdout=subprocess.PIPE).stdout
        tpuzz = str(result.decode()).split("===========")
        print(tpuzz[0])
        puzzles.extend(tpuzz)
    for i, p in enumerate(puzzles):
        p = p.split('\n')
        p = p[0:3] + p[4:7] + p[8:11]
        for j, l in enumerate(p):
            l.split(' ')
            p[j] = l[0:3] + l[4:7] + l[8:11]
            p[j] = [c for c in p[j]]
        puzzles[i] = p
    with open("puzzles.json", "w") as outfile:
        json.dump(puzzles, outfile)