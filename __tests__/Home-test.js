/**
 * @format
 */

import 'react-native';
import React from 'react';
import Home from '../ui_screens/home';
import NetInfo from "@react-native-community/netinfo";
// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer';

import { ApplicationProvider, IconRegistry, Icon } from '@ui-kitten/components';

global.fetch = jest.fn(() => new Promise(resolve => resolve()));
jest.mock('react-native-gesture-handler', () => { });
jest.mock('@react-native-community/netinfo', () => ({
    addEventListener: jest.fn(),
}));
jest.mock('@ui-kitten/components', () => ({ Icon: 'Icon' }));
// jest.mock('react-native', () => ({
//     NetInfo: {
//         isConnected: {
//             fetch: jest.fn()
//         }
//     }
// }))

jest.useFakeTimers()

it('Matches Snapshot', async () => {
    const tree = renderer
        .create(<Home />)
        .toJSON();
    expect(tree).toMatchSnapshot();
});
it('renders correctly', async () => {
    NetInfo.addEventListener.mockResolvedValueOnce(true)

    renderer.create(<Home />);
});