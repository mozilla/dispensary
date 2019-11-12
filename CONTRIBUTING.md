Thanks for wanting to contribute to Mozilla's Dispensary! You rock! 😊

## Submitting a Pull Request

If you're submitting a pull request, please reference the issue it closes inside your pull request. Keep your commits atomic; you should have one commit per issue solved.

Add tests for your code and make sure all existing tests pass. If the tests fail or you don't maintain 100% test coverage we won't be able to accept your pull request.

### Tests

Our tests include `eslint` and prettier checks for code style, these keep our code consistent.

Prettier will reformat code to match style guidelines run `npm run prettier` prior to committing code.

Please run the tests locally with `npm test` before you commit.

[eslint]: https://github.com/mozilla/dispensary/blob/master/.eslintrc
