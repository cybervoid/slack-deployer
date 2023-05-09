#!/bin/bash
SHA1="deployer:master-$(git rev-parse --verify HEAD)-1"
REPO=969105443985.dkr.ecr.us-east-1.amazonaws.com
docker image remove ${REPO}/"${SHA1}"

aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin "${REPO}"
docker build --no-cache -t deployer .
docker tag deployer:latest "${REPO}"/"${SHA1}"
docker push "${REPO}"/"${SHA1}"
kubectl set image deployment/slack-deployer slack-deployer="${REPO}"/"${SHA1}" --record
kubectl rollout restart deployment slack-deployer
