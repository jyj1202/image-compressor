import inquirer from 'inquirer';
import * as fs from 'node:fs/promises';
import path from 'path';
import tinify from 'tinify';

export default class ImagesCompresser {
  inputDir = '';

  constructor(tinifyKey) {
    tinify.key = tinifyKey;
  }

  async startCompression() {
    try {
      await this.getDirectoryFromUser();
      console.log('start resolve');
      await this.compressImages(this.inputDir);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async getDirectoryFromUser() {
    const questions = [
      {
        type: 'input',
        name: 'directory',
        message: '输入要进行处理的目录:',
      },
    ];

    const answers = await inquirer.prompt(questions);
    this.inputDir = path.resolve(answers.directory);
  }

  async compressImages(directory) {
    const files = await fs.readdir(directory);

    for (const file of files) {
      const filePath = path.join(directory, file);
      const stat = await fs.stat(filePath);

      if (stat.isDirectory()) {
        await this.compressImages(filePath); // 递归处理子目录
      } else if (this.isImageFile(filePath)) {
        await this.compressImage(filePath); // 压缩图片文件
      }
    }
  }

  isImageFile(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    return ['.png', '.jpg', '.jpeg', '.gif'].includes(ext);
  }

  async compressImage(filePath) {
    try {
      const sourceData = await fs.readFile(filePath);
      const compressedData = await tinify.fromBuffer(sourceData).toBuffer();
      await fs.writeFile(filePath, compressedData);
      console.log(`Compressed: ${filePath}`);
    } catch (error) {
      console.error(`Error compressing ${filePath}:`, error);
    }
  }
}