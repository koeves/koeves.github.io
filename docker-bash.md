# Interactive Bash session with Docker on Mac

1. Install and run Docker Desktop [here](https://docs.docker.com/docker-for-mac/install/).

2. In the Terminal cd to working directory

3. Create a file named `Dockerfile` in working directory

4. Open Dockerfile and add the following lines:

   ```
   FROM ubuntu:latest

   RUN apt-get update
   RUN apt-get upgrade -y
   RUN apt install build-essential python python-pexpect libreadline-dev flex valgrind -y
   ```
   
5. Build docker image by running

   ```
   docker build -t test .
   ```
   Where 'test' is the name of the image.

6. Run docker image with

   ```
   docker run -it -v $PWD:/files test bash
   ```
   
   * `-it` runs Docker in interactive mode
   * `-v $PWD:/files` copies all files for current working directory to /files within the Docker image
   * `test` is the name of the Docker image to run
   * `bash` runs `/bin/bash`
   
   And now you have a shell :)
