import test from 'node:test';
import {checkClientSyntax} from '../scripts/check-client-syntax.mjs';
test('Los archivos JavaScript públicos y privados tienen sintaxis válida',checkClientSyntax);
