import os

with open("joblist.txt", "r") as joblist:
    jobs = joblist.read().splitlines()[1:]

    for i, job in enumerate(jobs):
        cmd = f'{job} > puzzles/{i}.txt'
        print(cmd)
        os.system(f'{job} > puzzles/{i}.txt')