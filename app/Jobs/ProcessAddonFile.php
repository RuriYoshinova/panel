<?php

namespace Pterodactyl\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Bus\Batchable;
use Illuminate\Support\Facades\Log;
use Pterodactyl\Models\Server;
use Yosymfony\Toml\Toml;
use Pterodactyl\Repositories\Wings\DaemonFileRepository;

class ProcessAddonFile implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels, Batchable;

    protected $server;
    protected $addonDirectory;
    protected $filename;

    public function __construct(Server $server, $addonDirectory, $filename)
    {
        $this->server = $server;
        $this->addonDirectory = $addonDirectory;
        $this->filename = $filename;
    }

    public function handle(DaemonFileRepository $fileRepository)
    {
        try {
            Log::debug("Processing addon file: {$this->filename}");
            $serverFileRepo = $fileRepository->setServer($this->server);
            $content = $serverFileRepo->getContent("{$this->addonDirectory}.index/{$this->filename}");
            $parsed = Toml::parse($content);
            Log::debug("Successfully processed file: {$this->filename}");
            return $parsed;
        } catch (\Exception $e) {
            Log::error('Error processing file: ' . $this->filename . '. Error: ' . $e->getMessage());
            throw $e;
        }
    }
}
