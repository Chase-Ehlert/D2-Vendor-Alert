const databaseService = jest.mock('./database-service.ts')

describe('<DatabaseService/>', () => {
  it('should instantiate', () => {
    expect(databaseService).not.toBeNull()
  })
})
