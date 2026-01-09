#!/bin/bash
cd /home/kavia/workspace/code-generation/user-portal-platform-228610-228621/user_backend
npm run lint
LINT_EXIT_CODE=$?
if [ $LINT_EXIT_CODE -ne 0 ]; then
  exit 1
fi

