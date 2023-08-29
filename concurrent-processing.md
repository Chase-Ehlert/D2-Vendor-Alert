## D2-Vendor-Alert Concurrent Processing

### Description/Goal:
At the time of writing, the bot alerts users who have authorized it one-at-a-time by reading from a database collection. This behavior will become quite slow when there are many users signed up to be alerted by the bot. The goal of this design doc is to illustrate how to introduce concurrent processing into the alert system to speed up how long the bot takes to alert every user that has signed up.

### Milestones:
- build test dataset of 1000 users
- benchmark how long the bot currently takes to alert all 1000 users
- decide on a tolerable amount of users to be alerted on a single process
- explore Worker Threads as a solution and understand any current limitations/issues
- setup Worker Threads to handle said amount of users per process
- benchmark how long new implementation takes compared to the preexisting time
