/**
 * @format
 */

import 'react-native';
import React from 'react';
import App from '../App';

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

import { ApplicationProvider, IconRegistry } from '@ui-kitten/components';

global.fetch = jest.fn(() => new Promise(resolve => resolve()));
jest.mock('react-native-gesture-handler', () => {});
jest.mock('@react-native-community/netinfo', () => {});


jest.useFakeTimers()

it('renders correctly', async  () => {
  const tree = renderer
  .create(<App />)
  .toJSON();
expect(tree).toMatchSnapshot();
});
