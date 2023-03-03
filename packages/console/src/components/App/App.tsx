import 'intersection-observer';
import * as React from 'react';
import { CssBaseline, Collapse } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/styles';
import { FlyteApiProvider } from '@flyteorg/flyte-api';
import { SnackbarProvider } from 'notistack';
import { FeatureFlagsProvider } from 'basics/FeatureFlags';
import { env, updateEnv, AppConfig } from '@flyteorg/common';
import { debug, debugPrefix } from 'common/log';
import { ErrorBoundary } from 'components/common/ErrorBoundary';
import { APIContext, useAPIState } from 'components/data/apiContext';
import { QueryAuthorizationObserver } from 'components/data/QueryAuthorizationObserver';
import { createQueryClient } from 'components/data/queryCache';
import { SystemStatusBanner } from 'components/Notifications/SystemStatusBanner';
import {
  skeletonColor,
  skeletonHighlightColor,
  updateConstants,
} from 'components/Theme/constants';
import { getMuiTheme } from 'components/Theme/muiTheme';
import { SkeletonTheme } from 'react-loading-skeleton';
import { QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query-devtools';
import { Router } from 'react-router-dom';
import { ApplicationRouter } from 'routes/ApplicationRouter';
import { history } from 'routes/history';
import { NavBarRouter } from 'routes/NavBarRouter';
import { LocalCacheProvider } from 'basics/LocalCache/ContextProvider';

const queryClient = createQueryClient();

interface AppComponentProps {
  registry?: {
    nav?: React.FC<any>;
  };
  env?: any;
  config?: AppConfig;
}

let overrided = false;

export const AppComponent: React.FC<AppComponentProps> = (
  props: AppComponentProps,
) => {
  if (!overrided) {
    updateEnv(props.env);
    updateConstants(props.config);
    overrided = true;
  }

  if (env.NODE_ENV === 'development') {
    debug.enable(`${debugPrefix}*:*`);
  }
  const apiState = useAPIState();

  return (
    <FeatureFlagsProvider>
      <LocalCacheProvider>
        <ThemeProvider theme={getMuiTheme(props.config)}>
          <SnackbarProvider
            // Notifications provider https://iamhosseindhv.com/notistack/demos
            maxSnack={2}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            TransitionComponent={Collapse}
          >
            <QueryClientProvider client={queryClient}>
              <FlyteApiProvider flyteApiDomain={env.ADMIN_API_URL}>
                <APIContext.Provider value={apiState}>
                  <QueryAuthorizationObserver />
                  <SkeletonTheme
                    color={skeletonColor}
                    highlightColor={skeletonHighlightColor}
                  >
                    <CssBaseline />
                    <Router history={history}>
                      <ErrorBoundary fixed={true}>
                        <NavBarRouter registry={props?.registry} />
                        <ApplicationRouter />
                      </ErrorBoundary>
                    </Router>
                    <SystemStatusBanner />
                  </SkeletonTheme>
                </APIContext.Provider>
              </FlyteApiProvider>
              <ReactQueryDevtools initialIsOpen={false} />
            </QueryClientProvider>
          </SnackbarProvider>
        </ThemeProvider>
      </LocalCacheProvider>
    </FeatureFlagsProvider>
  );
};

export const App = AppComponent;