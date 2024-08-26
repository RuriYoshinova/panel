import { Addon, index as getIndex, search, limit, providers } from '@/api/server/addons';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import AddonItem from '@/components/elements/AddonItem';
import Spinner from '@/components/elements/Spinner';
import React, { useState, useEffect } from 'react';
import { ServerContext } from '@/state/server';
import Select from '@/components/elements/Select';
import Input from '@/components/elements/Input';
import Label from '@/components/elements/Label';

interface ExtendedAddon extends Addon {
    isInstalled: boolean;
}

const AddonContainer = () => {
    const uuid = ServerContext.useStoreState((state) => state.server.data!.uuid);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [pageSize, setPageSize] = useState<limit>(10);
    const [provider, setProvider] = useState<providers>('modrinth');
    const [addons, setAddons] = useState<ExtendedAddon[]>([]);
    const [expandedAddon, setExpandedAddon] = useState<string | null>(null);

    useEffect(() => {
        const handler = setTimeout(async () => {
            const fetchAddons = async () => {
                setLoading(true);
                try {
                    const searchData = (await search(uuid, searchTerm, pageSize, provider)).data;
                    const indexData = (await getIndex(uuid)).data;

                    const addonsData = searchData.hits.map((hit) => {
                        const isInstalled = indexData.some((indexed) => {
                            if (!indexed.update.modrinth) return false;
                            return indexed.update.modrinth['mod-id'] === hit.project_id;
                        });

                        return { ...hit, isInstalled };
                    });

                    setAddons(addonsData);
                } catch (error) {
                    console.error(error);
                }
                setLoading(false);
            };

            fetchAddons();
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm, pageSize, provider]);

    const toggle = (addonId: string) => {
        setExpandedAddon(expandedAddon === addonId ? null : addonId);
    };

    return (
        <ServerContentBlock title='Add-ons'>
            <div className='select-none relative flex flex-col items-center rounded-xl justify-center h-full w-full'>
                {expandedAddon && (
                    <div
                        className='fixed inset-0 w-screen h-screen bg-black opacity-50 z-40'
                        onClick={() => setExpandedAddon(null)}
                    ></div>
                )}
                <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6'>
                    <div className='w-full sm:w-auto mt-5'>
                        <Input
                            id='search'
                            type='search'
                            placeholder='Search add-ons...'
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className='w-full outline-none appearance-none z-10 p-2.5 pl-4 pr-3.5 rounded-lg border-none'
                        />
                    </div>
                    <div className='flex flex-wrap sm:flex-nowrap gap-4'>
                        <div className='w-full sm:w-auto'>
                            <Label className='block mb-1'>Page size</Label>
                            <Select
                                id='size'
                                className='w-full sm:w-24 outline-none appearance-none z-10 p-2.5 pl-4 pr-3.5 rounded-lg border-none'
                                onChange={(e) => setPageSize(parseInt(e.target.value) as limit)}
                            >
                                <option value='5'>5</option>
                                <option value='10'>10</option>
                                <option value='25'>25</option>
                                <option value='50'>50</option>
                                <option value='100'>100</option>
                            </Select>
                        </div>
                        <div className='w-full sm:w-auto'>
                            <Label className='block mb-1'>Provider</Label>
                            <Select
                                id='provider'
                                className='w-full sm:w-32 outline-none appearance-none z-10 p-2.5 pl-4 pr-3.5 rounded-lg border-none'
                                onChange={(e) => setProvider(e.target.value as providers)}
                            >
                                <option value='all'>All</option>
                                <option value='modrinth'>Modrinth</option>
                                <option value='curseforge'>Curseforge</option>
                            </Select>
                        </div>
                    </div>
                </div>
                {loading ? (
                    <Spinner size={'large'} />
                ) : addons.length <= 0 ? (
                    <p>No Add-ons found</p>
                ) : (
                    <div className='relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full'>
                        {addons.map((addon) => (
                            <AddonItem
                                uuid={uuid}
                                key={addon.project_id}
                                addon={addon}
                                isExpanded={expandedAddon === addon.project_id}
                                onToggle={() => toggle(addon.project_id)}
                                isInstalled={addon.isInstalled}
                            />
                        ))}
                    </div>
                )}
            </div>
        </ServerContentBlock>
    );
};

export default AddonContainer;
