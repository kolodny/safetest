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

bootstrap({
    container,
    element: (
        <Provider store={store}>
            <BrowserRouter basename={config.basename}>
                <App />
            </BrowserRouter>
        </Provider>
    ),
    render: (e, c) => {
        const root = createRoot(c);
        root.render(e);
        return root;
    },
    import: async (s) => import(`${s.replace(/.*src/, '.').replace(/\.safetest$/, '')}.safetest`)
});

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
