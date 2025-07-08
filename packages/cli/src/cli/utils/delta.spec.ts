import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createDeltaProcessor } from "./delta";
import * as path from "path";
import { tryReadFile, writeFile, checkIfFileExists } from "../utils/fs";
import YAML from "yaml";

// Setup mocks before importing the module
vi.mock("object-hash", () => ({
  MD5: vi.fn().mockImplementation((value) => `mocked-hash-${value}`),
}));

// Mock dependencies
vi.mock("path", () => ({
  join: vi.fn(() => "/mocked/path/i18n.lock"),
}));

vi.mock("../utils/fs", () => ({
  tryReadFile: vi.fn(),
  writeFile: vi.fn(),
  checkIfFileExists: vi.fn(),
}));

// Import MD5 after mocking
import { MD5 } from "object-hash";

describe("createDeltaProcessor", () => {
  const mockFileKey = "test-file-key";
  let processor;

  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the mock implementation for MD5
    (MD5 as any).mockImplementation((value) => `mocked-hash-${value}`);
    // Create a new processor instance for each test
    processor = createDeltaProcessor(mockFileKey);
  });

  describe("checkIfLockExists", () => {
    it("should call checkIfFileExists with the correct path", async () => {
      (checkIfFileExists as any).mockResolvedValue(true);

      const result = await processor.checkIfLockExists();

      expect(path.join).toHaveBeenCalledWith(process.cwd(), "i18n.lock");
      expect(checkIfFileExists).toHaveBeenCalledWith("/mocked/path/i18n.lock");
      expect(result).toBe(true);
    });
  });

  describe("calculateDelta", () => {
    describe("added", () => {
      it("should correctly identify added keys", async () => {
        const sourceData = { key1: "value1", key2: "value2", key3: "value3" };
        const targetData = { key1: "value1" };
        const checksums = { key1: "invalid-checksum1" };

        const result = await processor.calculateDelta({
          sourceData,
          targetData,
          checksums,
        });

        expect(result.added).toEqual(["key2", "key3"]);
        expect(result.hasChanges).toBe(true);
      });

      it("should correctly identify added keys based on checksums", async () => {
        const sourceData = { key1: "value1", key2: "value2", key3: "value3" };
        const targetData = { key1: "value1" };
        const checksums = {
          key1: "invalid-checksum1",
          key3: "mocked-hash-value3",
        };

        const result = await processor.calculateDelta({
          sourceData,
          targetData,
          checksums,
        });

        expect(result.added).toEqual(["key2"]);
        expect(result.hasChanges).toBe(true);
      });
    });

    describe("removed", () => {
      it("should correctly identify removed keys", async () => {
        const sourceData = { key1: "value1" };
        const targetData = { key1: "value1", key2: "value2" };
        const checksums = { key1: "checksum1", key2: "checksum2" };

        const result = await processor.calculateDelta({
          sourceData,
          targetData,
          checksums,
        });

        expect(result.removed).toEqual(["key2"]);
        expect(result.hasChanges).toBe(true);
      });
    });

    describe("updated", () => {
      it("should correctly identify updated keys", async () => {
        const sourceData = { key1: "new-value1" };
        const targetData = { key1: "value1" };
        const checksums = { key1: "old-checksum" }; // Different from MD5(new-value1)

        const result = await processor.calculateDelta({
          sourceData,
          targetData,
          checksums,
        });

        expect(result.updated).toContain("key1");
        expect(result.hasChanges).toBe(true);
      });
    });

    describe("renamed", () => {
      it("should correctly identify renamed keys", async () => {
        const sourceData = { newKey: "value1" };
        const targetData = { oldKey: "something" };
        const checksums = { oldKey: "mocked-hash-value1" };

        const result = await processor.calculateDelta({
          sourceData,
          targetData,
          checksums,
        });

        expect(result.renamed).toEqual([["oldKey", "newKey"]]);
        expect(result.added).toEqual([]);
        expect(result.removed).toEqual([]);
        expect(result.hasChanges).toBe(true);
      });

      it("should correctly identify renamed f keys", async () => {
        const sourceData = { newKey: "value1" };
        const targetData = { oldKey: "something" };
        const checksums = { oldKey: "mocked-hash-value1" };

        const result = await processor.calculateDelta({
          sourceData,
          targetData,
          checksums,
        });

        expect(result.renamed).toEqual([["oldKey", "newKey"]]);
        expect(result.added).toEqual([]);
        expect(result.removed).toEqual([]);
        expect(result.hasChanges).toBe(true);
      });

      it("should correctly identify renamed sequential keys (eg. for Markdown)", async () => {
        const sourceData = {
          section1: "value1",
          section2: "new-value2",
          section3: "new-value3",
          section4: "original-value2",
          section5: "original-value3",
        };
        const targetData = {};
        const checksums = {
          section1: "mocked-hash-value1",
          section2: "mocked-hash-original-value2",
          section3: "mocked-hash-original-value3",
        };

        const result = await processor.calculateDelta({
          sourceData,
          targetData,
          checksums,
        });

        expect(result.renamed).toEqual([
          ["section2", "section4"],
          ["section3", "section5"],
        ]);
        expect(result.added).toEqual(["section2", "section3"]);
        expect(result.removed).toEqual([]);
        expect(result.hasChanges).toBe(true);
      });
    });

    describe("hasChanges", () => {
      it("should return hasChanges=false when there are no changes", async () => {
        const sourceData = { key1: "value1" };
        const targetData = { key1: "value1" };
        const checksums = { key1: "mocked-hash-value1" };

        const result = await processor.calculateDelta({
          sourceData,
          targetData,
          checksums,
        });

        expect(result.added).toEqual([]);
        expect(result.removed).toEqual([]);
        expect(result.updated).toEqual([]);
        expect(result.renamed).toEqual([]);
        expect(result.hasChanges).toBe(false);
      });

      it("should return hasChanges=false when there are no changes based on checksums", async () => {
        const sourceData = { key1: "value1", key2: "value2", key3: "value3" };
        const targetData = { key1: "value1", key2: "value3" };
        const checksums = {
          key2: "mocked-hash-value2",
          key3: "mocked-hash-value3",
        };

        const result = await processor.calculateDelta({
          sourceData,
          targetData,
          checksums,
        });

        expect(result.added).toEqual([]);
        expect(result.removed).toEqual([]);
        expect(result.updated).toEqual([]);
        expect(result.renamed).toEqual([]);
        expect(result.hasChanges).toBe(false);
      });
    });
  });

  describe("loadLock", () => {
    it("should return default lock data when no file exists", async () => {
      (tryReadFile as any).mockReturnValue(null);

      const result = await processor.loadLock();

      expect(result).toEqual({
        version: 1,
        checksums: {},
      });
    });

    it("should parse and return lock file data when it exists", async () => {
      const mockYaml = "version: 1\nchecksums:\n  fileId:\n    key1: checksum1";
      (tryReadFile as any).mockReturnValue(mockYaml);

      const result = await processor.loadLock();

      expect(result).toEqual({
        version: 1,
        checksums: {
          fileId: {
            key1: "checksum1",
          },
        },
      });
    });
  });

  describe("saveLock", () => {
    it("should stringify and save lock data", async () => {
      const lockData = {
        version: 1 as const,
        checksums: {
          fileId: {
            key1: "checksum1",
          },
        },
      };

      await processor.saveLock(lockData);

      expect(writeFile).toHaveBeenCalledWith(
        "/mocked/path/i18n.lock",
        expect.any(String),
      );

      // Verify the YAML conversion is correct
      const yamlArg = (writeFile as any).mock.calls[0][1];
      const parsedBack = YAML.parse(yamlArg);
      expect(parsedBack).toEqual(lockData);
    });
  });

  describe("loadChecksums and saveChecksums", () => {
    it("should load checksums for the specific file key", async () => {
      // Mock the loadLock to return specific data
      const mockLockData = {
        version: 1 as const,
        checksums: {
          [`mocked-hash-${mockFileKey}`]: {
            key1: "checksum1",
          },
        },
      };

      vi.spyOn(processor, "loadLock").mockResolvedValue(mockLockData);

      const result = await processor.loadChecksums();

      expect(result).toEqual({
        key1: "checksum1",
      });
    });

    it("should save checksums for the specific file key", async () => {
      const checksums = { key1: "checksum1" };

      // Mock loadLock and saveLock
      const mockLockData = {
        version: 1 as const,
        checksums: {},
      };
      vi.spyOn(processor, "loadLock").mockResolvedValue(mockLockData);
      const saveLockSpy = vi
        .spyOn(processor, "saveLock")
        .mockResolvedValue(void 0);

      await processor.saveChecksums(checksums);

      expect(saveLockSpy).toHaveBeenCalledWith({
        version: 1,
        checksums: {
          [`mocked-hash-${mockFileKey}`]: checksums,
        },
      });
    });
  });

  describe("createChecksums", () => {
    it("should create checksums from source data", async () => {
      const sourceData = {
        key1: "value1",
        key2: "value2",
      };

      const result = await processor.createChecksums(sourceData);

      expect(result).toEqual({
        key1: "mocked-hash-value1",
        key2: "mocked-hash-value2",
      });
    });
  });
});
