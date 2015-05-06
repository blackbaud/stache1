# This file ignores pull requests, which means
# the documentation will only be updated on pushes to master.
if [ "$TRAVIS_PULL_REQUEST" == "false" ]; then
  echo -e "Starting to update sky docs\n"

  git config --global user.email "travis@travis-ci.org"
  git config --global user.name "Travis"
  git clone --quiet https://${GH_TOKEN}@github.com/blackbaud/sky-docs.git docs > /dev/null

  # Copies the first sub directory of the coverage folder

  cd coverage/*/
  cp -rf * ../../docs/static/status/coverage-raw/
  cd ../../


  cp -f coverage/coverage.json docs/data/
  cp -f coverage/results.json docs/data/
  echo "`date -u`" > docs/includes/timestamp.txt

  cd docs
  git add -f .
  git commit -m "Travis build $TRAVIS_BUILD_NUMBER pushed to sky-docs"
  git push -fq origin master > /dev/null

  echo -e "Sky Docs successfully updated.\n"
fi
