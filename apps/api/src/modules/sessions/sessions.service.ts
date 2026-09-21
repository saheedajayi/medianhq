import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { BookingStatus } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import type { AuthUser } from '../auth/dto/auth.dto';
import type { AvailabilityDto, CreateMentorSessionDto, UpdateMentorSessionDto } from './dto';

@Injectable()
export class SessionsService {
  constructor(private readonly prisma: PrismaService) {}
  private ensureMentor(user: AuthUser) { if (user.role !== 'MENTOR') throw new ForbiddenException('Only mentors can manage sessions.'); }
  list(user: AuthUser) { this.ensureMentor(user); return this.prisma.mentorSession.findMany({ where: { mentorId: user.id }, orderBy: { createdAt: 'asc' } }); }
  async create(user: AuthUser, dto: CreateMentorSessionDto) { this.ensureMentor(user); return this.prisma.mentorSession.create({ data: { mentorId: user.id, title: dto.title, description: dto.description, durationMinutes: dto.durationMinutes, price: dto.price ?? 0, type: dto.type ?? 'ONE_ON_ONE', maxCapacity: dto.maxCapacity, flyerUrl: dto.flyerUrl, isLive: false } }); }
  async update(user: AuthUser, id: string, dto: UpdateMentorSessionDto) { this.ensureMentor(user); const existing = await this.prisma.mentorSession.findFirst({ where: { id, mentorId: user.id } }); if (!existing) throw new NotFoundException('Session not found.'); return this.prisma.mentorSession.update({ where: { id }, data: dto }); }
  async remove(user: AuthUser, id: string) { this.ensureMentor(user); const existing = await this.prisma.mentorSession.findFirst({ where: { id, mentorId: user.id } }); if (!existing) throw new NotFoundException('Session not found.'); await this.prisma.mentorSession.delete({ where: { id } }); return { id, deleted: true }; }
  availability(user: AuthUser) { this.ensureMentor(user); return this.prisma.weeklyAvailability.findMany({ where: { mentorId: user.id }, orderBy: { dayOfWeek: 'asc' } }); }
  async saveAvailability(user: AuthUser, slots: AvailabilityDto[]) { this.ensureMentor(user); await this.prisma.$transaction(slots.map((slot) => this.prisma.weeklyAvailability.upsert({ where: { mentorId_dayOfWeek: { mentorId: user.id, dayOfWeek: slot.dayOfWeek } }, create: { mentorId: user.id, ...slot }, update: { startTime: slot.startTime, endTime: slot.endTime, isActive: slot.isActive ?? true } }))); return this.availability(user); }
  complete(bookingId: string) { return { bookingId, status: BookingStatus.COMPLETED }; }
}
