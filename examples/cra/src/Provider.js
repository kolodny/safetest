import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';

import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline, StyledEngineProvider } from '@mui/material';

// defaultTheme
import themes from './themes';

// project imports
import NavigationScroll from './layout/NavigationScroll';

// ==============================|| APP ||============================== //

export const Provider = (props) => {
    const customization = useSelector((state) => state.customization);

    return (
        <StyledEngineProvider injectFirst>
            <ThemeProvider theme={themes(customization)}>
                <CssBaseline />
                <NavigationScroll>{props.children}</NavigationScroll>
            </ThemeProvider>
        </StyledEngineProvider>
    );
};

Provider.propTypes = {
    children: PropTypes.node
};
