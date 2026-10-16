import { useNavigate, useOutletContext } from 'react-router';
import {
    Button,
    ButtonGroup,
    Form,
    MenuItem,
    Select,
    Typography,
    useSelectValidator
} from '@ace-clublabs/shared-component-library';
import { useTagging } from '../../../hooks';
import { Pages } from '../../../shared/pages';
import { setWeatherDamage } from '../../../store/actions';
import { State } from '../../../store/reducer';
import React from 'react';
import { weatherDamageOptions, IWeatherDamageOptions } from '@lib/types';

const config = {
    KNOCKOUT_REASONS: [],
    navigation: {
        prevPage: undefined,
        parked: Pages.WhoWasDriving,
        beingDriven: Pages.WhoWasDriving
    }
};
export const DamageByWeather = () => {
    const [appState, dispatch] = useOutletContext<[State, Function]>();
    const navigate = useNavigate();

    useTagging();

    const navigateTo = weatherDamage => {
        dispatch(setWeatherDamage(weatherDamage));
        navigate(config.navigation[`${appState.carStatus}`]);
    };

    return (
        <div>
            <Typography variant='h5Medium'>What caused the weather damage?</Typography>
            <Form
                sx={{
                    marginTop: '0'
                }}
                /* @ts-ignore */
                onSubmit={(data: { weatherDamage: IWeatherDamageOptions }) => {
                    navigateTo(data.weatherDamage);
                }}>
                <Select<IWeatherDamageOptions>
                    id='select-vehicle'
                    defaultValue={appState.vehicleDamageWeather}
                    label='Select what happened'
                    //@ts-ignore
                    placeholder='Select one'
                    fullWidth
                    validator={useSelectValidator()}
                    name='weatherDamage'
                    getDisplayText={option => option.description}>
                    {weatherDamageOptions.map((option, index) => (
                        <MenuItem key={index} value={option as any}>
                            {option.description}
                        </MenuItem>
                    ))}
                </Select>
                <ButtonGroup>
                    <Button type='submit' fullWidth variant='contained' id='next-button' label='Next' />
                </ButtonGroup>
            </Form>
        </div>
    );
};
