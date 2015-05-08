/*
 * Geddy JavaScript Web development framework
 * Copyright 2112 Matthew Eernisse (mde@fleegix.org)
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
*/


var router = new geddy.RegExpRouter();

router.get('/').to('Main.index');

// Basic routes
// router.match('/moving/pictures/:id', 'GET').to('Moving.pictures');
//
// router.match('/farewells/:farewelltype/kings/:kingid', 'GET').to('Farewells.kings');
//
// Can also match specific HTTP methods only
// router.get('/xandadu').to('Xanadu.specialHandler');
// router.del('/xandadu/:id').to('Xanadu.killItWithFire');
//
// Resource-based routes
// router.resource('hemispheres');
//
// Nested Resource-based routes
// router.resource('hemispheres', function(){
//   this.resource('countries');
//   this.get('/print(.:format)').to('Hemispheres.print');
// });

router.get('/accounts/signin').to('Accounts.signin');
router.post('/accounts/signin(.:format)').to('Accounts.authenticate');
router.get('/accounts/signout').to('Accounts.signout');
router.get('/accounts/register').to('Accounts.register');
router.get('/accounts/:id/users/:userId(.:format)').to('Accounts.showUser');
router.post('/accounts/:id/users(.:format)').to('Accounts.addUser');
router.put('/accounts/:id/users/:userId(.:format)').to('Accounts.updateUser');
router.get('/accounts/:id/edit_users(.:format)').to('Accounts.editUsers');
router.get('/accounts/:id/users/:userId/activity_grid/:cellIndex(.:format)').to('Accounts.showUserActivityGridCell');
router.put('/accounts/:id/users/:userId/activity_grid/:cellIndex(.:format)').to('Accounts.updateUserActivityGridCell');
router.get('/accounts/:id/users/:userId/prizes/:prizeIndex(.:format)').to('Accounts.showUserPrize');
router.put('/accounts/:id/users/:userId/prizes/:prizeIndex(.:format)').to('Accounts.updateUserPrize');
router.get('/accounts/:id/users/:userId/reading_log(.:format)').to('Accounts.showUserReadingLog');
router.put('/accounts/:id/users/:userId/reading_log(.:format)').to('Accounts.updateUserReadingLog');
router.get('/reports').to('Reports.index');
router.post('/badges/update_file(.:format)').to('Badges.updateFile');
router.get('/accounts/pick_winners').to('Accounts.pickWinners');


router.resource('accounts');
router.resource('grids');
router.resource('prizes');
router.resource('branches');
router.resource('user_types');
router.resource('grid_icons');
router.resource('badges');

router.get('/helps/help').to('Helps.applicationHelp');

exports.router = router;
