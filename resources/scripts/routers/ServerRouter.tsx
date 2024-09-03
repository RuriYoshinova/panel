import TransferListener from '@/components/server/TransferListener';
import React, { useEffect, useState } from 'react';
import { NavLink, Route, Switch, useRouteMatch } from 'react-router-dom';
import TransitionRouter from '@/TransitionRouter';
import WebsocketHandler from '@/components/server/WebsocketHandler';
import { ServerContext } from '@/state/server';
import { CSSTransition } from 'react-transition-group';
import Spinner from '@/components/elements/Spinner';
import { NotFound, ServerError } from '@/components/elements/ScreenBlock';
import { httpErrorToHuman } from '@/api/http';
import { useStoreState } from 'easy-peasy';
import Sidebar from '@/components/elements/Sidebar';
import InstallListener from '@/components/server/InstallListener';
import ErrorBoundary from '@/components/elements/ErrorBoundary';
import { useLocation } from 'react-router';
import ConflictStateRenderer from '@/components/server/ConflictStateRenderer';
import PermissionRoute from '@/components/elements/PermissionRoute';
import routes from '@/routers/routes';
import tw, { styled } from 'twin.macro';
import NavigationBar from '@/components/NavigationBar';
import Can from '@/components/elements/Can';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const ServerContainer = styled.div`
    ${tw`flex h-full overflow-auto`};
    flex-direction: row;
`;

const ContentContainer = styled.div`
    ${tw`flex-1 transition-all duration-300 ease-in-out`};
`;

export default () => {
    const match = useRouteMatch<{ id: string }>();
    const location = useLocation();

    const rootAdmin = useStoreState((state) => state.user.data!.rootAdmin);
    const [error, setError] = useState('');
    const [sidebarToggle, setSidebarToggle] = useState(false);

    const id = ServerContext.useStoreState((state) => state.server.data?.id);
    const uuid = ServerContext.useStoreState((state) => state.server.data?.uuid);
    const inConflictState = ServerContext.useStoreState((state) => state.server.inConflictState);
    const serverId = ServerContext.useStoreState((state) => state.server.data?.internalId);
    const getServer = ServerContext.useStoreActions((actions) => actions.server.getServer);
    const clearServerState = ServerContext.useStoreActions((actions) => actions.clearServerState);

    const to = (value: string, url = false) => {
        if (value === '/') {
            return url ? match.url : match.path;
        }
        return `${(url ? match.url : match.path).replace(/\/*$/, '')}/${value.replace(/^\/+/, '')}`;
    };

    useEffect(
        () => () => {
            clearServerState();
        },
        []
    );

    useEffect(() => {
        setError('');

        getServer(match.params.id).catch((error) => {
            console.error(error);
            setError(httpErrorToHuman(error));
        });

        return () => {
            clearServerState();
        };
    }, [match.params.id]);

    const toggleSidebar = () => {
        setSidebarToggle(!sidebarToggle);
    };

    return (
        <React.Fragment key={'server-router'}>
            {!uuid || !id ? (
                error ? (
                    <ServerError message={error} />
                ) : (
                    <Spinner size={'large'} centered />
                )
            ) : (
                <ServerContainer>
                    <CSSTransition in={sidebarToggle} timeout={300} classNames='sidebar' unmountOnExit>
                        <Sidebar sidebarToggle={toggleSidebar}>
                            {routes.server
                                .filter((route) => !!route.name)
                                .map((route) =>
                                    route.permission ? (
                                        <Can key={route.path} action={route.permission} matchAny>
                                            <NavLink to={to(route.path, true)} exact={route.exact}>
                                                <div className='flex flex-row gap-4'>
                                                    <FontAwesomeIcon icon={route.icon!} /> {route.name}
                                                </div>
                                            </NavLink>
                                        </Can>
                                    ) : (
                                        <NavLink key={route.path} to={to(route.path, true)} exact={route.exact}>
                                            <div className='flex flex-row gap-4'>
                                                <FontAwesomeIcon icon={route.icon!} /> {route.name}
                                            </div>
                                        </NavLink>
                                    )
                                )}
                            {rootAdmin && (
                                <a href={`/admin/servers/view/${serverId}`} target={'_blank'} rel='noreferrer'>
                                    <div className='flex flex-row gap-4'>
                                        <FontAwesomeIcon icon={faExternalLinkAlt} /> Manage
                                    </div>
                                </a>
                            )}
                        </Sidebar>
                    </CSSTransition>
                    <ContentContainer>
                        <NavigationBar sidebarToggle={toggleSidebar} />
                        <InstallListener />
                        <TransferListener />
                        <WebsocketHandler />
                        {inConflictState &&
                        (!rootAdmin || (rootAdmin && !location.pathname.endsWith(`/server/${id}`))) ? (
                            <ConflictStateRenderer />
                        ) : (
                            <ErrorBoundary>
                                <TransitionRouter>
                                    <div className='lg:px-8'>
                                        <Switch location={location}>
                                            {routes.server.map(({ path, permission, component: Component }) => (
                                                <PermissionRoute
                                                    key={path}
                                                    permission={permission}
                                                    path={to(path)}
                                                    exact
                                                >
                                                    <Spinner.Suspense>
                                                        <Component />
                                                    </Spinner.Suspense>
                                                </PermissionRoute>
                                            ))}
                                            <Route path={'*'} component={NotFound} />
                                        </Switch>
                                    </div>
                                </TransitionRouter>
                            </ErrorBoundary>
                        )}
                    </ContentContainer>
                </ServerContainer>
            )}
        </React.Fragment>
    );
};
