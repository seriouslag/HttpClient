// abortcontroller polyfill is needed for node envs less than 15.0
import 'abortcontroller-polyfill/dist/abortcontroller-polyfill-only';
import jestMock from 'jest-fetch-mock';

jestMock.enableMocks();
