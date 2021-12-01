"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.includeEntityParser = void 0;
const includeEntityParser = ({ fileContent, store, }) => {
    const jsonData = fileContent;
    if (jsonData.metadata?.includes) {
        jsonData.metadata?.includes.forEach((includePath) => {
            if (includePath.toLowerCase().endsWith('entity.entityinclude')) {
                const includePathArray = includePath.split('.');
                const lastPath = includePathArray.pop();
                const mountPoint = includePathArray.pop();
                if (lastPath && mountPoint) {
                    const fileContentJsonIncludeElement = includePathArray.reduce((previous, current) => previous?.[current], fileContent);
                    fileContentJsonIncludeElement[mountPoint] =
                        fileContentJsonIncludeElement[mountPoint][lastPath]
                            .split('/')
                            .reduce((prev, curr) => prev && prev[curr], store.data);
                }
            }
        });
    }
};
exports.includeEntityParser = includeEntityParser;
