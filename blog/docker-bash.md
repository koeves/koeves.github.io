---
layout: post
author: me
date: 2019-11-27
title: Interactive Bash session with Docker on Mac
---

1. Install and run Docker Desktop [here](https://docs.docker.com/docker-for-mac/install/).

2. In the Terminal `cd` to working directory

3. Create a file named `Dockerfile` in working directory

4. Open Dockerfile and add the following lines:

   ```
   <span style="color:blue">FROM</span> ubuntu:latest

   <span style="color:blue">RUN</span> apt-get update
   <span style="color:blue">RUN</span> apt-get upgrade -y
   <span style="color:blue">RUN</span> apt install build-essential python3 python-pexpect libreadline-dev flex valgrind -y
   ```
   
5. Build docker image by running

   ```
   $ docker build -t test .
   ```
   Where `test` is the name of the image.

6. Run docker image with

   ```
   $ docker run -it -v $PWD:/files test bash
   ```
   
   * `-it` runs Docker in interactive mode
   * `-v $PWD:/files` links current working directory to /files within the Docker image
   * `test` is the name of the Docker image to run
   * `bash` runs `/bin/bash`
   
   And now you have a shell :)
