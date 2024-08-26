<?php

use Aternos\Taskmaster\Task\Task;
use Yosymfony\Toml\Toml;

class ReadAndParseTask extends Task
{
    protected $serverFileRepo;
    protected $filePath;

    public function __construct($serverFileRepo, $filePath)
    {
        $this->serverFileRepo = $serverFileRepo;
        $this->filePath = $filePath;
    }

    public function run(): mixed
    {
        $content = $this->serverFileRepo->getContent($this->filePath);
        return Toml::parse($content);
    }
}
