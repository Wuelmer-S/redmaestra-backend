import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import * as faceapi from '@vladmandic/face-api/dist/face-api.node.js';
import { Canvas, Image, ImageData, loadImage } from 'canvas';
import { UsersService } from '../../../users/users.service';

// Configurar face-api para usar canvas
// @ts-ignore
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

@Injectable()
export class ProcessIdentityCardUseCase {
  private readonly logger = new Logger(ProcessIdentityCardUseCase.name);
  private modelsLoaded = false;

  constructor(private readonly usersService: UsersService) {}

  private async loadModels() {
    if (this.modelsLoaded) return;
    try {
      this.logger.log('Comprobando modelos de reconocimiento facial...');
      if (
        !faceapi.nets.ssdMobilenetv1.params ||
        !faceapi.nets.faceLandmark68Net.params ||
        !faceapi.nets.faceRecognitionNet.params
      ) {
         const modelsPath = './models';
         await faceapi.nets.ssdMobilenetv1.loadFromDisk(modelsPath);
         await faceapi.nets.faceLandmark68Net.loadFromDisk(modelsPath);
         await faceapi.nets.faceRecognitionNet.loadFromDisk(modelsPath);
         this.modelsLoaded = true;
         this.logger.log('Modelos de reconocimiento facial cargados correctamente desde ./models');
      } else {
         this.modelsLoaded = true;
      }
    } catch (err) {
      this.logger.error(`Error comprobando/cargando modelos de Face-API: ${err.message}`);
    }
  }

  async verifyFacialMatch(idCardBuffer: Buffer, selfieBuffer: Buffer) {
    await this.loadModels();

    if (!faceapi.nets.faceRecognitionNet.params) {
        this.logger.error('Modelos de reconocimiento facial no disponibles.');
        throw new BadRequestException('El sistema de verificación facial no está inicializado (faltan pesos neuronales).');
    }

    try {
      const idImg = await loadImage(idCardBuffer);
      const selfieImg = await loadImage(selfieBuffer);

      // @ts-ignore
      const idFace = await faceapi.detectSingleFace(idImg).withFaceLandmarks().withFaceDescriptor();
      if (!idFace) {
        throw new BadRequestException('No se pudo detectar un rostro claro en la imagen del carnet.');
      }

      // @ts-ignore
      const selfieFace = await faceapi.detectSingleFace(selfieImg).withFaceLandmarks().withFaceDescriptor();
      if (!selfieFace) {
        throw new BadRequestException('No se pudo detectar un rostro claro en la selfie proporcionada.');
      }

      const distance = faceapi.euclideanDistance(idFace.descriptor, selfieFace.descriptor);
      const threshold = 0.6;
      const isMatch = distance < threshold;

      return {
        success: isMatch,
        verified: isMatch,
        match_score: distance,
        message: isMatch 
            ? 'Verificación facial exitosa. El rostro coincide.' 
            : 'Verificación fallida. El rostro de la selfie no coincide con el del carnet.',
        kyc_data: {
          face_match: isMatch,
          confidence_distance: distance,
        }
      };

    } catch (err) {
      if (err instanceof BadRequestException) throw err;
      this.logger.error('Error durante la verificación facial:', err);
      throw new BadRequestException('Ocurrió un error inesperado al procesar las imágenes.');
    }
  }

  // Mantenemos este para compatibilidad con la ruta antigua de verificación manual, si es necesaria
  async execute(idCardBuffer: Buffer, selfieBuffer: Buffer, userId: string) {
    const result = await this.verifyFacialMatch(idCardBuffer, selfieBuffer);

    const user = await this.usersService.findById(userId);
    const currentRun = user?.run || 'NO_OCR';
    
    if (result.success) {
      await this.usersService.updateKYC(userId, currentRun, result);
    }

    return result;
  }
}
