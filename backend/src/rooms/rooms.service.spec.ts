import { ConflictException } from '@nestjs/common';
import { RoomsService } from './rooms.service';

describe('RoomsService', () => {
  let service: RoomsService;
  let roomsRepository: { find: jest.Mock };
  let dataSource: { query: jest.Mock };

  beforeEach(() => {
    roomsRepository = {
      find: jest.fn(),
    };
    dataSource = {
      query: jest.fn(),
    };
    service = new RoomsService(roomsRepository as never, dataSource as never);
  });

  describe('findAll', () => {
    it('returns all active rooms with status when no date is provided', async () => {
      roomsRepository.find.mockResolvedValue([
        { id: '1', kode: '1.1', lantai: 1, nomor: 1, isActive: true },
        { id: '2', kode: '1.2', lantai: 1, nomor: 2, isActive: false },
      ]);

      const result = await service.findAll();

      expect(result).toEqual([
        { id: '1', kode: '1.1', lantai: 1, nomor: 1, isActive: true, status: 'Tersedia' },
        { id: '2', kode: '1.2', lantai: 1, nomor: 2, isActive: false, status: 'Tidak Tersedia' },
      ]);
    });

    it('delegates to findAvailability when date parameter is passed', async () => {
      dataSource.query.mockResolvedValue([
        { id: '1', kode: '6.1', lantai: 6, nomor: 1, isActive: 1, activeBookings: '0' },
        { id: '2', kode: '6.2', lantai: 6, nomor: 2, isActive: 1, activeBookings: '1' },
      ]);

      const result = await service.findAll('2026-12-04');

      expect(dataSource.query).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0].status).toBe('Tersedia');
      expect(result[1].status).toBe('Sedang Digunakan');
    });
  });

  describe('findAvailability', () => {
    it('throws ConflictException if date format is invalid', async () => {
      await expect(service.findAvailability('invalid-date')).rejects.toThrow(ConflictException);
    });

    it('correctly maps room status based on booking and active state', async () => {
      dataSource.query.mockResolvedValue([
        { id: '1', kode: '1.1', lantai: 1, nomor: 1, isActive: 1, activeBookings: '0' },
        { id: '2', kode: '1.2', lantai: 1, nomor: 2, isActive: 1, activeBookings: '2' },
        { id: '3', kode: '1.3', lantai: 1, nomor: 3, isActive: 0, activeBookings: '0' },
      ]);

      const result = await service.findAvailability('2026-12-04');

      expect(result).toEqual([
        { id: '1', kode: '1.1', lantai: 1, nomor: 1, isActive: true, status: 'Tersedia' },
        { id: '2', kode: '1.2', lantai: 1, nomor: 2, isActive: true, status: 'Sedang Digunakan' },
        { id: '3', kode: '1.3', lantai: 1, nomor: 3, isActive: false, status: 'Tidak Tersedia' },
      ]);
    });
  });
});

