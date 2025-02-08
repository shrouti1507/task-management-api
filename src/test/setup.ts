beforeEach(() => {
  jest.clearAllMocks();
});

afterAll(async () => {
  // Clean up any remaining handlers
  await new Promise(resolve => setTimeout(resolve, 500));
}); 