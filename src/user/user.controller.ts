import { Get, Post, Body, Put, Delete, Headers, Param, Controller } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user.entity';
import { CreateUserDto, LoginUserDto } from './user.dto';
import {HttpException} from '@nestjs/core';
import * as crypto from 'crypto';
import {SECRET} from '../config';
import * as jwt from 'jsonwebtoken';

@Controller()
export class UserController {

  constructor(private readonly userService: UserService) {}

  @Get('user')
  async findMe(@Headers('authorization') authorization: string): Promise<User> {
    const token = authorization.split(' ')[1];
    const decoded: any = jwt.verify(token, SECRET);
    const user = await this.userService.findByEmail(decoded.email);
    return user;
  }

  
  @Post('users')
  async create(@Body('user') userData: CreateUserDto) {
    return this.userService.create(userData);
  }

  @Put('users/:slug')
  async update(@Param() params, @Body() userData: CreateUserDto) {
    // Todo: update slug also when title gets changed
    return this.userService.update(params.slug, userData);
  }

  @Delete('users/:slug')
  async delete(@Param() params) {
    return this.userService.delete(params.slug);
  }

  @Post('users/login')
  async login(@Body('user') userLoginData: LoginUserDto): Promise<string> {
    const user = await this.userService.findOne(
      {
        email: userLoginData.email,
        password: crypto.createHmac('sha256', userLoginData.password).digest('hex'),
      }
    );

    if (!user) throw new HttpException('User not found.', 401);

    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
    };

    return await this.userService.generateJWT(payload);
  }
}