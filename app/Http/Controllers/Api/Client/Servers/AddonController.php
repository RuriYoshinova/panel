<?php

namespace Pterodactyl\Http\Controllers\Api\Client\Servers;

use Pterodactyl\Http\Controllers\Api\Client\ClientApiController;
use Pterodactyl\Repositories\Wings\DaemonFileRepository;
use Illuminate\Support\Facades\Cache;
use Pterodactyl\Models\Server;
use Illuminate\Http\Request;
use Yosymfony\Toml\Toml;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AddonController extends ClientApiController
{
    public function __construct(
        private DaemonFileRepository $fileRepository
    ) {
        parent::__construct();
    }

    public function index(Request $request, Server $server)
    {
        $results = [];
        $serverFileRepo = $this->fileRepository
            ->setServer($server);

        $addonDirectory = [
            'fabric' => 'mods/',
            'spigot' => 'plugins/',
        ][strtolower($server->egg->name)] ?? null;

        $indexDirectory = $serverFileRepo->getDirectory("$addonDirectory.index/");
        return response()->json($results);
    }

    public function search(Request $request)
    {
        $query = $request->input('query');
        $url = 'https://api.modrinth.com/v2/search';

        $response = Http::withHeaders([
            'User-Agent' => "RurinGS"
        ])->get($url, [
                    'query' => $query,
                    'limit' => $request->input('limit')
                ]);

        if ($response->ok()) {
            return response()->json($response->json());
        } else {
            return response()->json(['error' => 'Failed to fetch add-ons'], $response->status());
        }
    }

    public function getVersions(Request $request)
    {
        $projectId = $request->input('projectId');
        $url = "https://api.modrinth.com/v2/project/$projectId/version";

        $response = Http::withHeaders([
            'User-Agent' => "RurinGS"
        ])->get($url);

        if ($response->ok()) {
            return response()->json($response->json());
        } else {
            return response()->json(['error' => 'Failed to fetch version list'], $response->status());
        }
    }

    public function download(Request $request, Server $server)
    {
        $serverFileRepo = $this->fileRepository
            ->setServer($server);

        $nest = strtolower($server->nest->name);
        $egg = strtolower($server->egg->name);

        if ($nest !== 'minecraft') {
            return response()->json(['error' => 'Unsupported nest'], 400);
        }

        $directoryMap = [
            'fabric' => 'mods/',
            'spigot' => 'plugins/',
        ];

        $addonDirectory = $directoryMap[$egg] ?? null;

        if (!$addonDirectory) {
            return response()->json(['error' => 'Unsupported egg'], 400);
        }

        $versionId = $request->input('versionId');

        if (!$versionId) {
            return response()->json(['error' => 'Missing versionId'], 400);
        }

        $url = "https://api.modrinth.com/v2/version/$versionId";

        $response = Http::withHeaders([
            'User-Agent' => "RurinGS"
        ])->get($url);

        if (!$response->ok()) {
            return response()->json(['error' => 'Failed to fetch add-on'], $response->status());
        }

        $downloadURL = $response->json()['files'][0]['url'];
        $fileName = $response->json()['files'][0]['filename'];

        $fileContent = Http::get($downloadURL)->body();

        $serverFileRepo->putContent("/$addonDirectory$fileName", $fileContent);

        return response()->json(['message' => 'Add-on downloaded successfully']);
    }
}
