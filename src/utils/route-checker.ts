import { INestApplication } from '@nestjs/common';
import { ModulesContainer, Reflector } from '@nestjs/core';
import { PATH_METADATA, METHOD_METADATA } from '@nestjs/common/constants';

interface RouteCheck {
  method: string;
  path: string;
}

export function checkRoutes(app: INestApplication, expectedRoutes: RouteCheck[]) {
  const modulesContainer = app.get(ModulesContainer);
  const reflector = new Reflector();

  const mappedRoutes: RouteCheck[] = [];

  for (const [_, module] of modulesContainer) {
  const controllers = [...module.controllers.values()].filter(Boolean); // skip undefined
  controllers.forEach((ctrl: any) => {
    const prefix = reflector.get(PATH_METADATA, ctrl) || '';
    if (!ctrl.prototype) return; // skip if no prototype

    const methods = Object.getOwnPropertyNames(ctrl.prototype)
      .filter((m) => typeof ctrl.prototype[m] === 'function' && m !== 'constructor');

    methods.forEach((methodName) => {
      const routePath = reflector.get(PATH_METADATA, ctrl.prototype[methodName]);
      const requestMethod = reflector.get(METHOD_METADATA, ctrl.prototype[methodName]);
      if (routePath && requestMethod) {
        mappedRoutes.push({
          method: requestMethod.toUpperCase(),
          path: normalizePath(`${prefix}${routePath}`),
        });
      }
    });
  });
}

  expectedRoutes.forEach((r) => {
    const found = mappedRoutes.some(
      (m) => m.method === r.method && normalizePath(r.path) === m.path
    );
    console.log(`${r.method} ${r.path} → ${found ? '✅ Exists' : '❌ Missing'}`);
  });
}

function normalizePath(path: string) {
  return path.replace(/:([a-zA-Z0-9_]+)/g, ':param');
}
