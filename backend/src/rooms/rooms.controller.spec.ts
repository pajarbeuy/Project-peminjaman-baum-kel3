import { RoomsController } from './rooms.controller';

describe('RoomsController', () => {
  let controller: RoomsController;
  let roomsService: { findAll: jest.Mock; findAvailability: jest.Mock };

  beforeEach(() => {
    roomsService = {
      findAll: jest.fn(),
      findAvailability: jest.fn(),
    };
    controller = new RoomsController(roomsService as never);
  });

  it('calls roomsService.findAll with date parameter', async () => {
    const expected = [{ id: '1', kode: '1.1', lantai: 1, nomor: 1, isActive: true, status: 'Tersedia' }];
    roomsService.findAll.mockResolvedValue(expected);

    const result = await controller.findAll('2026-12-04');

    expect(roomsService.findAll).toHaveBeenCalledWith('2026-12-04');
    expect(result).toBe(expected);
  });

  it('calls roomsService.findAvailability for availability endpoint', async () => {
    const expected = [{ id: '1', kode: '1.1', lantai: 1, nomor: 1, isActive: true, status: 'Tersedia' }];
    roomsService.findAvailability.mockResolvedValue(expected);

    const result = await controller.availability('2026-12-04');

    expect(roomsService.findAvailability).toHaveBeenCalledWith('2026-12-04');
    expect(result).toBe(expected);
  });
});

