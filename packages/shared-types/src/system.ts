export interface SystemStats {
  cpu: {
    manufacturer: string;
    brand: string;
    speed: number;
    cores: number;
    physicalCores: number;
    usage: {
      system: number;
      server: number;
    };
  };
  memory: {
    total: number;
    free: number;
    used: number;
    active: number;
    available: number;
    serverUsed: number;
  };
  disk: Array<{
    fs: string;
    type: string;
    size: number;
    used: number;
    available: number;
    mount: string;
    use: number;
  }>;
  os: {
    platform: string;
    distro: string;
    release: string;
    hostname: string;
    arch: string;
  };
}
