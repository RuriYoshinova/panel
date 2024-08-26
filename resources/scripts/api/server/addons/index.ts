import http from '@/api/http';
import { AxiosResponse } from 'axios';

export interface Addon {
    icon_url: string | undefined;
    title: string;
    description: string;
    project_id: string;
    versions: string[];
}

export interface SearchResponse {
    hits: Addon[];
}

export interface VersionsResponse {
    version_number: string;
}

export type limit = 10 | 25 | 50 | 100;

export type providers = 'modrinth' | 'curseforge';

export interface IndexResponse {
    filename: string;
    name: string;
    side: string;
    download: {
        hash: string;
        'hash-format': string;
        mode: string;
        url: string;
    };
    update: {
        modrinth?: {
            'mod-id': string;
            version: string;
        };
    };
}

export function index(uuid: string): Promise<AxiosResponse<IndexResponse[]>> {
    return http.get(`/api/client/servers/${uuid}/addons`);
}

export function search(
    uuid: string,
    query: string,
    limit: limit,
    provider: providers
): Promise<AxiosResponse<SearchResponse>> {
    return http.get(`/api/client/servers/${uuid}/addons/search?query=${query}&limit=${limit}&provider=${provider}`);
}

export function fetch_versions(
    uuid: string,
    projectId: string,
    gameVersion: string | null | undefined
): Promise<AxiosResponse<VersionsResponse[]>> {
    return http.get(`/api/client/servers/${uuid}/addons/versions?projectId=${projectId}&game_versions=${gameVersion}`);
}

export function download(uuid: string, versionId: string): Promise<AxiosResponse> {
    return http.get(`/api/client/servers/${uuid}/addons/download?versionId=${versionId}`);
}
