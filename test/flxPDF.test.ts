import { before, after, beforeEach } from 'mocha';
import { expect } from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import { flxPDF } from '../src/flxPDF'
import { Types } from '../src/Types';
import del from 'del';

describe('flxPDF', () => {
    let service: flxPDF;
    let filePath: string;

    beforeEach(() => {
        service = new flxPDF();
        filePath = path.join(__dirname, 'Test1.pdf');
    });

    after(() => {
        del([
            './src/tmp/**/*',
            './src/tmp'
        ]);
    })

    context('writeFile', () => {
        it('should create a file when ArrayBuffer is provided', async () => {
            // Arrange
            let data: ArrayBuffer = new Uint8Array(fs.readFileSync(filePath));

            // Act
            let result: Types.Result = await service.writeFile(data, Types.Mode.ArrayBuffer);
            let exists: boolean = fs.existsSync(result.data);

            // Assert
            expect(result).to.be.a('object');
            expect(result).to.have.property('success');
            expect(result.success).to.equal(true);
            expect(result).to.have.property('data');
            expect(result.data).to.be.a('string').and.satisfies((data: string) => { return data.endsWith('.pdf'); });
            expect(exists).to.be.true;
        });

        it('should create a file when Base64 string is provided', async () => {
            // Arrange
            let data: string = fs.readFileSync(filePath).toString('base64');

            // Act
            let result: Types.Result = await service.writeFile(data, Types.Mode.Base64);
            let exists: boolean = fs.existsSync(result.data);

            // Assert
            expect(result).to.be.a('object');
            expect(result).to.have.property('success');
            expect(result.success).to.equal(true);
            expect(result).to.have.property('data');
            expect(result.data).to.be.a('string').and.satisfies((data: string) => { return data.endsWith('.pdf'); });
            expect(exists).to.be.true;
        });

        it('should create a file when Buffer is provided', async () => {
            // Arrange
            let data: Buffer = fs.readFileSync(filePath);

            // Act
            let result: Types.Result = await service.writeFile(data, Types.Mode.Buffer);
            let exists: boolean = fs.existsSync(result.data);

            // Assert
            expect(result).to.be.a('object');
            expect(result).to.have.property('success');
            expect(result.success).to.equal(true);
            expect(result).to.have.property('data');
            expect(result.data).to.be.a('string').and.satisfies((data: string) => { return data.endsWith('.pdf'); });
            expect(exists).to.be.true;
        });

        it('should copy the file when path is provided', async () => {
            // Arrange

            // Act
            let result: Types.Result = await service.writeFile(filePath, Types.Mode.File);
            let exists: boolean = fs.existsSync(result.data);

            // Assert
            expect(result).to.be.a('object');
            expect(result).to.have.property('success');
            expect(result.success).to.equal(true);
            expect(result).to.have.property('data');
            expect(result.data).to.be.a('string').and.satisfies((data: string) => { return data.endsWith('Test1.pdf'); });
            expect(exists).to.be.true;
        });
    });

    context('getPageCount', () => {
        it('should return 14', async () => {
            // Arrange

            // Act
            let result: Types.Result = await service.getPageCount(filePath);

            // Assert
            expect(result).to.be.a('object');
            expect(result).to.have.property('success');
            expect(result.success).to.equal(true);
            expect(result).to.have.property('data');
            expect(result.data).to.be.a('number').and.equal(14);
        });
    });

    context('convertPages', () => {
        it('should return 14', async () => {
            // Arrange

            // Act
            let result: Types.Result = await service.writeFile(filePath, Types.Mode.File);
            result = await service.convertPages(result.data);

            // Assert
            expect(result).to.be.a('object');
            expect(result).to.have.property('success');
            expect(result.success).to.equal(true);
            expect(result).to.have.property('data');
            expect(result.data).to.be.a('array');
            expect(result.data.length).to.equal(14);
        }).timeout(60000);
    });

    context('getData', () => {
        it('should return an ArrayBuffer', async () => {
            // Arrange
            filePath = path.join(__dirname, 'test.pdf');

            // Act
            let files: Types.Result = await service.writeFile(filePath, Types.Mode.File);
            let pages = await service.convertPages(files.data);
            let result = await service.getData(pages.data, Types.Mode.ArrayBuffer);

            let data = new Uint8Array(fs.readFileSync(pages.data[0]));

            // Assert
            expect(result).to.be.a('object');
            expect(result).to.have.property('success');
            expect(result.success).to.equal(true);
            expect(result).to.have.property('data');
            expect(result.data).to.be.a('array');
            expect(result.data[0]).to.eql(data);
        }).timeout(60000);

        it('should return a Base64 string', async () => {
            // Arrange
            filePath = path.join(__dirname, 'test.pdf');

            // Act
            let files: Types.Result = await service.writeFile(filePath, Types.Mode.File);
            let pages = await service.convertPages(files.data);
            let result = await service.getData(pages.data, Types.Mode.Base64);

            let data = fs.readFileSync(pages.data[0]).toString('base64');

            // Assert
            expect(result).to.be.a('object');
            expect(result).to.have.property('success');
            expect(result.success).to.equal(true);
            expect(result).to.have.property('data');
            expect(result.data).to.be.a('array');
            expect(result.data[0]).to.eql(data);
        }).timeout(60000);

        it('should return a Buffer', async () => {
            // Arrange
            filePath = path.join(__dirname, 'test.pdf');

            // Act
            let files: Types.Result = await service.writeFile(filePath, Types.Mode.File);
            let pages = await service.convertPages(files.data);
            let result = await service.getData(pages.data, Types.Mode.Buffer);

            let data = fs.readFileSync(pages.data[0]) as Buffer;

            // Assert
            expect(result).to.be.a('object');
            expect(result).to.have.property('success');
            expect(result.success).to.equal(true);
            expect(result).to.have.property('data');
            expect(result.data).to.be.a('array');
            expect(result.data[0]).to.eql(data);
        }).timeout(60000);

        it('should return a File path', async () => {
            // Arrange
            filePath = path.join(__dirname, 'test.pdf');

            // Act
            let files: Types.Result = await service.writeFile(filePath, Types.Mode.File);
            let pages = await service.convertPages(files.data);
            let result = await service.getData(pages.data, Types.Mode.File);

            // Assert
            expect(result).to.be.a('object');
            expect(result).to.have.property('success');
            expect(result.success).to.equal(true);
            expect(result).to.have.property('data');
            expect(result.data).to.be.a('array');
            expect(result.data[0]).to.be.a('string').and.satisfies((result: string) => { return result.endsWith('.png'); });
        }).timeout(60000);
    });
});