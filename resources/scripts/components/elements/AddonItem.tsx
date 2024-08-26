import { faDownload } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { Addon, download, fetch_versions } from '@/api/server/addons';

type AddonItemProps = {
    uuid: string;
    addon: Addon;
    isExpanded: boolean;
    onToggle: any;
    isInstalled: boolean;
};

export default ({ uuid, addon, isExpanded, onToggle, isInstalled }: AddonItemProps) => {
    const [versions, setVersions] = useState<any[]>([]);
    const [selectedVersion, setSelectedVersion] = useState(versions[0] || '');

    useEffect(() => {
        if (isExpanded && versions.length <= 0) {
            const fetchVersions = async () => {
                const data = (await fetch_versions(uuid, addon.project_id, null)).data;
                setVersions(data.map((version: any) => version));
                setSelectedVersion(data[0]?.version_number || '');
            };

            fetchVersions();
        }
    }, [isExpanded]);

    const changeVersion = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedVersion(e.target.value);
    };

    const downloadAddon = async () => {
        const version = versions.find((v) => v.version_number === selectedVersion);
        if (version) {
            await download(uuid, version.id);
        } else {
            console.error('No version selected');
        }
    };

    return (
        <div
            className={[
                'flex flex-col cursor-pointer',
                'bg-gray-700 text-white hover:bg-slate-400 hover:text-slate-800',
                'rounded-lg shadow-lg p-3 mb-4 w-64 max-w-sm mx-auto',
                'transition-transform duration-300',
                isExpanded ? 'relative w-full h-auto z-50 transform scale-105 bg-slate-400' : '',
                'group',
            ]
                .filter(Boolean)
                .join(' ')}
            onClick={isExpanded ? undefined : onToggle}
        >
            <div className='flex mx-auto justify-center mb-4 h-48 w-48'>
                <img src={addon.icon_url} className='rounded-lg object-cover' />
            </div>
            <h3
                className={`
                text-center ${isExpanded ? 'text-slate-800' : ''}
                `}
            >
                {addon.title}
                {isInstalled && <p className='text-green-600'>(Installed)</p>}
            </h3>
            <p
                className={`text-center mx-auto max-w-fit overflow-hidden group-hover:text-slate-800 ${
                    isExpanded ? 'text-slate-800' : ''
                }`}
            >
                {addon.description}
            </p>
            {isExpanded && (
                <div className='flex items-center justify-between mt-4'>
                    <select
                        name='version'
                        id='version'
                        value={selectedVersion}
                        onChange={changeVersion}
                        className='flex-1 w-full mr-4 text-sm rounded-lg p-2.5 bg-slate-800 text-slate-300 border-gray-600 placeholder-gray-400 focus:ring-blue-500 focus:border-blue-500'
                    >
                        {versions.map((version) => (
                            <option
                                id={version.id}
                                key={version.id + '+' + version.version_number}
                                value={version.version_number}
                            >
                                ({version.game_versions.join(', ')}) {version.version_number}
                            </option>
                        ))}
                    </select>
                    <FontAwesomeIcon
                        icon={faDownload}
                        size='lg'
                        className='shrink-0 cursor-pointer'
                        onClick={downloadAddon}
                    />
                </div>
            )}
        </div>
    );
};
