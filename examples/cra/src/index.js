import { createRoot } from 'react-dom/client';

// third party
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { bootstrap } from 'safetest/react';

// project imports
import App from './App';
import { store } from './store';

// style + assets
// import 'assets/scss/style.scss';
import config from './config';

// ==============================|| REACT DOM RENDER  ||============================== //

const container = document.getElementById('root');

// const root = createRoot(container); // createRoot(container!) if you use TypeScript
// root.render(
//     <Provider store={store}>
//         <BrowserRouter basename={config.basename}>
//             <App />
//         </BrowserRouter>
//     </Provider>
// );

const root = createRoot(container);

bootstrap({
    container,
    element: (
        <Provider store={store}>
            <BrowserRouter basename={config.basename}>
                <App />
            </BrowserRouter>
        </Provider>
    ),
    render: (element) => root.render(element),
    webpackContext: import.meta.webpackContext('.', {
        recursive: true,
        regExp: /\.safetest$/,
        mode: 'lazy'
    })
});

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
