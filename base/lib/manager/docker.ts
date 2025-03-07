import Docker, { Container, ContainerCreateOptions } from "dockerode";

/*
 * Configuration constants for Docker container setup
 */
const DOCKER_IMAGE = "baraich/laravel-slim";
const CONTAINER_MEMORY_LIMIT = 128 * 1024 * 1024; // 128MB
const CPU_PERIOD = 10000;
const CPU_QUOTA = 5000;
const CONTAINER_PORT = "80/tcp";

/*
 * Interface defining the structure of project creation result
 */
interface ProjectCreationResult {
  port: number;
  containerId: string;
}

/*
 * ProjectManager class responsible for managing Docker-based projects
 */
export class ProjectManager {
  private docker: Docker;

  /*
   * Initializes the ProjectManager with a Docker instance
   */
  constructor() {
    this.docker = new Docker();
  }

  /*
   * Creates a new Docker container for a project
   * @returns Promise resolving to project creation details
   * @throws Error if container creation or startup fails
   */
  async createProject(): Promise<ProjectCreationResult> {
    try {
      /*
       * Define container configuration
       */
      const containerConfig: ContainerCreateOptions = {
        Image: DOCKER_IMAGE,
        HostConfig: {
          PortBindings: {
            [CONTAINER_PORT]: [{ HostPort: "0" }],
          },
          Memory: CONTAINER_MEMORY_LIMIT,
          CpuPeriod: CPU_PERIOD,
          CpuQuota: CPU_QUOTA,
        },
      };

      /*
       * Create and start the container
       */
      const container: Container = await this.docker.createContainer(
        containerConfig
      );
      await container.start();

      /*
       * Retrieve container details
       */
      const containerInfo = await container.inspect();
      const hostPort =
        containerInfo.NetworkSettings.Ports[CONTAINER_PORT]?.[0]?.HostPort;

      /*
       * Validate and parse port information
       */
      if (!hostPort) {
        throw new Error("Failed to retrieve container port");
      }

      const port = parseInt(hostPort, 10);
      if (isNaN(port)) {
        throw new Error("Invalid port number received from container");
      }

      /*
       * Return project creation result
       */
      return {
        port,
        containerId: container.id,
      };
    } catch (error) {
      /*
       * Handle and rethrow errors with context
       */
      const errorMessage =
        error instanceof Error
          ? `Project creation failed: ${error.message}`
          : "Unknown error during project creation";
      throw new Error(errorMessage);
    }
  }

  /*
   * Retrieves a Docker container by its container ID
   * @param containerId - ID of the container to retrieve
   * @returns Container object or null if not found
   */
  getContainer(containerId: string): Container | null {
    try {
      return this.docker.getContainer(containerId);
    } catch (error) {
      throw error;
    }
  }
}
