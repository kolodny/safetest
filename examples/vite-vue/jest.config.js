module.exports = {
  moduleFileExtensions: ['js', 'jsx', 'ts', 'tsx', 'json', 'vue'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
    '^.+\\.tsx$': 'ts-jest',
    '.*\\.(vue)$': '@vue/vue3-jest',
  },
  moduleNameMapper: {
    '\\.(jpg|jpeg|png|svg)$': '<rootDir>/src/empty.js',
  },
};
