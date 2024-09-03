import { ApplicationStore } from '@/state';
import { faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useStoreState } from 'easy-peasy';
import React, { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components/macro';
import tw, { theme } from 'twin.macro';

const SidebarContainer = styled.div`
    ${tw`h-full bg-neutral-900 shadow shadow-lg`};
    width: 10rem;
    z-index: 39;
    padding: 1rem;
    display: flex;
    flex-direction: column;
    transition: transform 0.3s ease-in-out;
    position: fixed;
    gap: 4rem;
    overflow: auto;

    &.sidebar-enter {
        transform: translateX(-100%);
    }

    &.sidebar-enter-active {
        transform: translateX(0);
    }

    &.sidebar-exit {
        transform: translateX(0);
    }

    &.sidebar-exit-active {
        transform: translateX(-100%);
    }
`;

const Children = styled.div`
    ${tw`flex flex-col gap-4`};

    & > div {
        ${tw`flex flex-col text-sm`};

        & > a,
        & > div {
            ${tw`py-3 px-4 text-neutral-300 no-underline transition-all duration-150`};

            &:not(:first-of-type) {
                ${tw`mt-2`};
            }

            &:hover {
                ${tw`text-neutral-100 bg-neutral-600`};
            }

            &:active,
            &.active {
                ${tw`text-neutral-100 bg-neutral-600`};
                border-left: 4px solid ${theme`colors.cyan.600`.toString()};
            }
        }
    }

    svg {
        width: 1rem !important;
    }
`;

interface SidebarProps {
    sidebarToggle: any;
    children: ReactNode;
}

const Sidebar: React.FC<SidebarProps> = ({ sidebarToggle, children }) => {
    const name = useStoreState((state: ApplicationStore) => state.settings.data!.name);
    return (
        <SidebarContainer>
            <div className={'flex flex-row'}>
                <div id={'logo'} className={''}>
                    <Link
                        to={'/'}
                        className={
                            'text-2xl font-header px-4 no-underline text-neutral-200 hover:text-neutral-100 transition-colors duration-150'
                        }
                    >
                        {name}
                    </Link>
                </div>
                <button onClick={sidebarToggle} className={'ml-auto'}>
                    <FontAwesomeIcon icon={faChevronLeft} className='w-8'></FontAwesomeIcon>
                </button>
            </div>

            <Children>{children}</Children>
        </SidebarContainer>
    );
};

export default Sidebar;
