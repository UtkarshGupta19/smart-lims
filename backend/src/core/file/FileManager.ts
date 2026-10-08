import { LabFile, FileSystemState } from '../../types.js';

export class FileManager {
  private totalBlocks = 64;
  private bitmap: boolean[] = new Array(64).fill(false);
  private files: LabFile[] = [];

  constructor() {
    this.seedFiles();
  }

  private seedFiles(): void {
    this.allocateFile('matlab_simulation_v1.m', 4, 'CONTIGUOUS');
    this.allocateFile('lab_dataset_2026.csv', 6, 'INDEXED');
    this.allocateFile('cadence_circuit_design.sch', 3, 'LINKED');
  }

  public getFileSystemState(): FileSystemState {
    const freeBlocks = this.bitmap.filter(b => !b).length;
    return {
      totalBlocks: this.totalBlocks,
      freeBlocks,
      blockBitmap: [...this.bitmap],
      files: [...this.files],
    };
  }

  public allocateFile(
    filename: string,
    sizeBlocks: number,
    allocationMethod: 'CONTIGUOUS' | 'LINKED' | 'INDEXED'
  ): { success: boolean; file?: LabFile; message: string } {
    const freeIndices: number[] = [];
    this.bitmap.forEach((used, i) => {
      if (!used) freeIndices.push(i);
    });

    if (freeIndices.length < sizeBlocks) {
      return { success: false, message: 'Insufficient free disk blocks available!' };
    }

    if (allocationMethod === 'CONTIGUOUS') {
      // Find contiguous block range
      let startIdx = -1;
      let count = 0;
      for (let i = 0; i < this.totalBlocks; i++) {
        if (!this.bitmap[i]) {
          if (count === 0) startIdx = i;
          count++;
          if (count === sizeBlocks) break;
        } else {
          count = 0;
          startIdx = -1;
        }
      }

      if (startIdx === -1 || count < sizeBlocks) {
        return { success: false, message: 'No contiguous block range of required size found!' };
      }

      const blocks: number[] = [];
      for (let i = startIdx; i < startIdx + sizeBlocks; i++) {
        this.bitmap[i] = true;
        blocks.push(i);
      }

      const file: LabFile = {
        filename,
        sizeBlocks,
        allocationMethod,
        startBlock: startIdx,
        blocks,
      };
      this.files.push(file);
      return { success: true, file, message: `File ${filename} allocated contiguously at block ${startIdx}` };
    } else if (allocationMethod === 'INDEXED') {
      if (freeIndices.length < sizeBlocks + 1) {
        return { success: false, message: 'Insufficient disk blocks for data + index block!' };
      }

      const indexBlock = freeIndices[0];
      this.bitmap[indexBlock] = true;
      const dataBlocks = freeIndices.slice(1, sizeBlocks + 1);
      dataBlocks.forEach(b => (this.bitmap[b] = true));

      const file: LabFile = {
        filename,
        sizeBlocks,
        allocationMethod,
        indexBlock,
        blocks: dataBlocks,
      };
      this.files.push(file);
      return { success: true, file, message: `File ${filename} allocated via Index Block ${indexBlock}` };
    } else {
      // LINKED
      const blocks = freeIndices.slice(0, sizeBlocks);
      blocks.forEach(b => (this.bitmap[b] = true));

      const file: LabFile = {
        filename,
        sizeBlocks,
        allocationMethod,
        startBlock: blocks[0],
        blocks,
      };
      this.files.push(file);
      return { success: true, file, message: `File ${filename} allocated via Linked pointers` };
    }
  }

  public deleteFile(filename: string): boolean {
    const idx = this.files.findIndex(f => f.filename === filename);
    if (idx === -1) return false;

    const file = this.files[idx];
    file.blocks.forEach(b => (this.bitmap[b] = false));
    if (file.indexBlock !== undefined) {
      this.bitmap[file.indexBlock] = false;
    }
    this.files.splice(idx, 1);
    return true;
  }
}

export const fileManager = new FileManager();
